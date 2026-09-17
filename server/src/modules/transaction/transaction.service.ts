import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { TransactionStatus, TransactionType, UserRole } from '@family-finance/shared'
import type { Money, Transaction, User } from '@family-finance/shared'
import type { ClientSession, HydratedDocument, UpdateQuery } from 'mongoose'
import { ApiError } from '../../utils/ApiError.js'
import type { CursorPaginationMeta } from '../../types/pagination.js'
import type { TransactionDoc } from '../../models/index.js'
import type { WalletRepository } from '../wallet/wallet.repository.js'
import type { WalletService } from '../wallet/wallet.service.js'
import { serializeTransaction } from './transaction.serializer.js'
import { TRANSACTION_ERROR_MESSAGES } from './transaction.constants.js'
import type { TransactionRepository, TransactionListFilter } from './transaction.repository.js'
import { decodeCursor } from './transaction.repository.js'
import type {
  TransactionCreateInput,
  TransactionListQuery,
  TransactionUpdateInput,
} from './transaction.schema.js'
import type {
  BalanceAdjustment,
  TransactionCreateData,
  TransactionDraft,
} from './transaction.types.js'

/** The fields of a transaction that drive balance effects. */
interface BalanceEffectSource {
  type: TransactionType
  status: TransactionStatus
  amount: Money
  walletId?: mongoose.Types.ObjectId
  sourceWalletId?: mongoose.Types.ObjectId
  destinationWalletId?: mongoose.Types.ObjectId
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
    private readonly walletService: WalletService,
  ) {}

  async createTransaction(actor: User, input: TransactionCreateInput): Promise<Transaction> {
    this.assertOwnerEligibility(actor, input.ownerId)
    const data = this.buildCreateData(actor.id, input)

    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      await this.validateWallets(data)
      const transaction = await this.transactionRepository.createWithSession(data, session)
      await this.applyEffect(session, this.getBalanceEffect(data))
      await session.commitTransaction()
      return serializeTransaction(transaction)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  async listTransactions(
    actor: User,
    query: TransactionListQuery,
  ): Promise<{ data: Transaction[]; pagination: CursorPaginationMeta }> {
    const filter = this.buildFilter(actor, query)
    const cursor = query.cursor ? decodeCursor(query.cursor) : null
    if (query.cursor && !cursor) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'INVALID_CURSOR',
        TRANSACTION_ERROR_MESSAGES.INVALID_CURSOR,
      )
    }
    const result = await this.transactionRepository.listCursor(filter, query.limit, cursor)
    return {
      data: result.items.map(serializeTransaction),
      pagination: {
        limit: query.limit,
        total: result.total,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      },
    }
  }

  async getTransaction(actor: User, transactionId: string): Promise<Transaction> {
    const transaction = this.requireReadable(
      actor,
      await this.transactionRepository.findById(transactionId),
    )
    return serializeTransaction(transaction)
  }

  async updateTransaction(
    actor: User,
    transactionId: string,
    input: TransactionUpdateInput,
  ): Promise<Transaction> {
    if (input.ownerId) {
      this.assertOwnerEligibility(actor, input.ownerId)
    }

    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      const existing = this.requireModifiable(
        actor,
        await this.transactionRepository.findByIdWithSession(transactionId, session),
      )
      const merged = this.mergeUpdate(existing, input)
      await this.validateWallets(merged)

      const oldEffect = this.getBalanceEffect(existing)
      const updated = await this.transactionRepository.updateByIdWithSession(
        transactionId,
        this.buildUpdateQuery(merged),
        session,
      )
      if (!updated) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'TRANSACTION_NOT_FOUND',
          TRANSACTION_ERROR_MESSAGES.NOT_FOUND,
        )
      }

      await this.reverseEffect(session, oldEffect)
      await this.applyEffect(session, this.getBalanceEffect(merged))
      await session.commitTransaction()
      return serializeTransaction(updated)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  async voidTransaction(actor: User, transactionId: string): Promise<Transaction> {
    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      const existing = this.requireModifiable(
        actor,
        await this.transactionRepository.findByIdWithSession(transactionId, session),
      )
      const updated = await this.transactionRepository.updateByIdWithSession(
        transactionId,
        { $set: { status: TransactionStatus.CANCELLED } },
        session,
      )
      if (!updated) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'TRANSACTION_NOT_FOUND',
          TRANSACTION_ERROR_MESSAGES.NOT_FOUND,
        )
      }

      await this.reverseEffect(session, this.getBalanceEffect(existing))
      await session.commitTransaction()
      return serializeTransaction(updated)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  private assertOwnerEligibility(actor: User, ownerId: string): void {
    if (actor.role !== UserRole.ADMIN && ownerId !== actor.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', TRANSACTION_ERROR_MESSAGES.OWNER_ONLY)
    }
  }

  private buildCreateData(actorId: string, input: TransactionCreateInput): TransactionCreateData {
    return {
      type: input.type,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      ownerId: new mongoose.Types.ObjectId(input.ownerId),
      walletId: input.walletId ? new mongoose.Types.ObjectId(input.walletId) : undefined,
      sourceWalletId: input.sourceWalletId
        ? new mongoose.Types.ObjectId(input.sourceWalletId)
        : undefined,
      destinationWalletId: input.destinationWalletId
        ? new mongoose.Types.ObjectId(input.destinationWalletId)
        : undefined,
      subCategoryId: input.subCategoryId
        ? new mongoose.Types.ObjectId(input.subCategoryId)
        : undefined,
      personId: input.personId ? new mongoose.Types.ObjectId(input.personId) : undefined,
      tagIds: input.tagIds.map((tagId) => new mongoose.Types.ObjectId(tagId)),
      notes: input.notes,
      date: new Date(input.date),
      createdBy: new mongoose.Types.ObjectId(actorId),
    }
  }

  private mergeUpdate(
    existing: HydratedDocument<TransactionDoc>,
    input: TransactionUpdateInput,
  ): TransactionDraft {
    return {
      type: input.type ?? existing.type,
      status: input.status ?? existing.status,
      amount: input.amount ?? existing.amount,
      currency: input.currency ?? existing.currency,
      ownerId: input.ownerId ? new mongoose.Types.ObjectId(input.ownerId) : existing.ownerId,
      walletId: input.walletId ? new mongoose.Types.ObjectId(input.walletId) : existing.walletId,
      sourceWalletId: input.sourceWalletId
        ? new mongoose.Types.ObjectId(input.sourceWalletId)
        : existing.sourceWalletId,
      destinationWalletId: input.destinationWalletId
        ? new mongoose.Types.ObjectId(input.destinationWalletId)
        : existing.destinationWalletId,
      subCategoryId: input.subCategoryId
        ? new mongoose.Types.ObjectId(input.subCategoryId)
        : existing.subCategoryId,
      personId:
        input.personId !== undefined
          ? input.personId
            ? new mongoose.Types.ObjectId(input.personId)
            : undefined
          : existing.personId,
      tagIds: input.tagIds
        ? input.tagIds.map((tagId) => new mongoose.Types.ObjectId(tagId))
        : existing.tagIds,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      date: input.date ? new Date(input.date) : existing.date,
    }
  }

  private buildUpdateQuery(merged: TransactionDraft): UpdateQuery<TransactionDoc> {
    const $set: Record<string, unknown> = {
      type: merged.type,
      status: merged.status,
      amount: merged.amount,
      currency: merged.currency,
      ownerId: merged.ownerId,
      tagIds: merged.tagIds,
      date: merged.date,
    }
    const $unset: Record<string, unknown> = {}
    const optionalFields: Array<
      keyof Pick<
        TransactionDraft,
        | 'walletId'
        | 'sourceWalletId'
        | 'destinationWalletId'
        | 'subCategoryId'
        | 'superCategoryId'
        | 'personId'
        | 'notes'
      >
    > = [
      'walletId',
      'sourceWalletId',
      'destinationWalletId',
      'subCategoryId',
      'superCategoryId',
      'personId',
      'notes',
    ]
    for (const field of optionalFields) {
      const value = merged[field]
      if (value === undefined) {
        $unset[field] = 1
      } else {
        $set[field] = value
      }
    }
    return { $set, ...(Object.keys($unset).length > 0 ? { $unset } : {}) }
  }

  private async validateWallets(source: TransactionDraft): Promise<void> {
    const ownerId = source.ownerId.toString()
    if (source.type === TransactionType.INCOME || source.type === TransactionType.EXPENSE) {
      if (source.walletId) {
        await this.assertWalletActiveForOwner(ownerId, source.walletId.toString())
      }
      return
    }
    if (source.type === TransactionType.TRANSFER) {
      if (source.sourceWalletId) {
        await this.assertWalletActiveForOwner(ownerId, source.sourceWalletId.toString())
      }
      if (source.destinationWalletId) {
        await this.assertWalletActiveForOwner(ownerId, source.destinationWalletId.toString())
      }
    }
  }

  private async assertWalletActiveForOwner(ownerId: string, walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId)
    if (!wallet) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'WALLET_NOT_FOUND',
        TRANSACTION_ERROR_MESSAGES.WALLET_NOT_FOUND,
      )
    }
    if (wallet.ownerId.toString() !== ownerId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'FORBIDDEN',
        TRANSACTION_ERROR_MESSAGES.WALLET_FORBIDDEN,
      )
    }
    if (wallet.isArchived) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'WALLET_ARCHIVED',
        TRANSACTION_ERROR_MESSAGES.WALLET_ARCHIVED,
      )
    }
  }

  private getBalanceEffect(source: BalanceEffectSource): BalanceAdjustment[] {
    if (source.status !== TransactionStatus.COMPLETED) {
      return []
    }
    if (source.type === TransactionType.INCOME && source.walletId) {
      return [{ walletId: source.walletId.toString(), amount: source.amount, direction: 1 }]
    }
    if (source.type === TransactionType.EXPENSE && source.walletId) {
      return [{ walletId: source.walletId.toString(), amount: source.amount, direction: -1 }]
    }
    if (
      source.type === TransactionType.TRANSFER &&
      source.sourceWalletId &&
      source.destinationWalletId
    ) {
      return [
        { walletId: source.sourceWalletId.toString(), amount: source.amount, direction: -1 },
        { walletId: source.destinationWalletId.toString(), amount: source.amount, direction: 1 },
      ]
    }
    return []
  }

  private async applyEffect(
    session: ClientSession,
    adjustments: BalanceAdjustment[],
  ): Promise<void> {
    for (const adjustment of adjustments) {
      if (adjustment.direction === 1) {
        await this.walletService.increaseBalance(adjustment.walletId, adjustment.amount, session)
      } else {
        await this.walletService.decreaseBalance(adjustment.walletId, adjustment.amount, session)
      }
    }
  }

  private async reverseEffect(
    session: ClientSession,
    adjustments: BalanceAdjustment[],
  ): Promise<void> {
    for (const adjustment of adjustments) {
      if (adjustment.direction === 1) {
        await this.walletService.decreaseBalance(adjustment.walletId, adjustment.amount, session, {
          skipArchivedCheck: true,
        })
      } else {
        await this.walletService.increaseBalance(adjustment.walletId, adjustment.amount, session, {
          skipArchivedCheck: true,
        })
      }
    }
  }

  private buildFilter(actor: User, query: TransactionListQuery): TransactionListFilter {
    const filter: TransactionListFilter = {}
    if (actor.role !== UserRole.ADMIN) {
      filter.ownerId = actor.id
    } else if (query.ownerId) {
      filter.ownerId = query.ownerId
    }

    if (query.type) {
      filter.type = query.type
    }
    if (query.status) {
      filter.status = query.status
    }
    if (query.walletId) {
      filter.walletId = query.walletId
    }
    if (query.superCategoryId) {
      filter.superCategoryId = query.superCategoryId
    }
    if (query.subCategoryId) {
      filter.subCategoryId = query.subCategoryId
    }
    if (query.personId) {
      filter.personId = query.personId
    }
    if (query.tagIds) {
      filter.tagIds = query.tagIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    }
    if (query.dateFrom || query.dateTo) {
      if (
        query.dateFrom &&
        query.dateTo &&
        resolveQueryDate(query.dateFrom) > resolveQueryDate(query.dateTo)
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'DATE_RANGE_INVALID',
          TRANSACTION_ERROR_MESSAGES.DATE_RANGE_INVALID,
        )
      }
      if (query.dateFrom) {
        filter.dateFrom = resolveQueryDate(query.dateFrom)
      }
      if (query.dateTo) {
        filter.dateTo = resolveQueryDate(query.dateTo, true)
      }
    }
    if (query.amountFrom) {
      filter.amountFrom = Number(query.amountFrom)
    }
    if (query.amountTo) {
      filter.amountTo = Number(query.amountTo)
    }
    if (query.search) {
      filter.search = query.search
    }
    return filter
  }

  private requireReadable(
    actor: User,
    transaction: HydratedDocument<TransactionDoc> | null,
  ): HydratedDocument<TransactionDoc> {
    if (!transaction) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'TRANSACTION_NOT_FOUND',
        TRANSACTION_ERROR_MESSAGES.NOT_FOUND,
      )
    }
    if (actor.role !== UserRole.ADMIN && transaction.ownerId.toString() !== actor.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', TRANSACTION_ERROR_MESSAGES.OWNER_ONLY)
    }
    return transaction
  }

  private requireModifiable(
    actor: User,
    transaction: HydratedDocument<TransactionDoc> | null,
  ): HydratedDocument<TransactionDoc> {
    const existing = this.requireReadable(actor, transaction)
    if (existing.status === TransactionStatus.CANCELLED) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'TRANSACTION_CANCELLED',
        TRANSACTION_ERROR_MESSAGES.CANCELLED,
      )
    }
    return existing
  }
}

function resolveQueryDate(value: string, isEnd = false): Date {
  if (DATE_ONLY_PATTERN.test(value)) {
    return new Date(`${value}${isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`)
  }
  return new Date(value)
}
