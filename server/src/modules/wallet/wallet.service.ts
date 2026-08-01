import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { addMoney, subtractMoney, ZERO_MONEY } from '@family-finance/shared'
import type { Money, Wallet } from '@family-finance/shared'
import type { HydratedDocument } from 'mongoose'
import { ApiError } from '../../utils/ApiError.js'
import { serializeWallet } from '../../utils/walletSerializer.js'
import type { WalletDoc } from '../../models/index.js'
import type { WalletRepository } from './wallet.repository.js'
import type { WalletCreateInput, WalletUpdateInput } from './wallet.schema.js'
import type { WalletCreateData } from './wallet.types.js'

export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async createWallet(actorId: string, input: WalletCreateInput): Promise<Wallet> {
    const data: WalletCreateData = {
      ownerId: new mongoose.Types.ObjectId(actorId),
      name: input.name,
      type: input.type,
      currency: input.currency,
      balance: ZERO_MONEY,
      isArchived: false,
      createdBy: new mongoose.Types.ObjectId(actorId),
      updatedBy: new mongoose.Types.ObjectId(actorId),
    }
    const wallet = await this.walletRepository.create(data)
    return serializeWallet(wallet)
  }

  async listWallets(actorId: string): Promise<Wallet[]> {
    const wallets = await this.walletRepository.listOwn(actorId)
    return wallets.map(serializeWallet)
  }

  async getWallet(actorId: string, walletId: string): Promise<Wallet> {
    const wallet = this.requireOwnWallet(actorId, await this.walletRepository.findById(walletId))
    return serializeWallet(wallet)
  }

  async updateWallet(actorId: string, walletId: string, input: WalletUpdateInput): Promise<Wallet> {
    const wallet = this.requireOwnWallet(actorId, await this.walletRepository.findById(walletId))
    if (wallet.isArchived) {
      throw new ApiError(StatusCodes.CONFLICT, 'WALLET_ARCHIVED', 'Wallet is archived')
    }
    const updated = await this.walletRepository.updateDetails(walletId, input)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'WALLET_NOT_FOUND', 'Wallet not found')
    }
    return serializeWallet(updated)
  }

  async archiveWallet(actorId: string, walletId: string): Promise<Wallet> {
    const wallet = this.requireOwnWallet(actorId, await this.walletRepository.findById(walletId))
    if (wallet.isArchived) {
      throw new ApiError(StatusCodes.CONFLICT, 'WALLET_ARCHIVED', 'Wallet is already archived')
    }
    const archived = await this.walletRepository.archive(walletId)
    if (!archived) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'WALLET_NOT_FOUND', 'Wallet not found')
    }
    return serializeWallet(archived)
  }

  async increaseBalance(walletId: string, amount: Money): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId)
    if (!wallet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'WALLET_NOT_FOUND', 'Wallet not found')
    }
    if (wallet.isArchived) {
      throw new ApiError(StatusCodes.CONFLICT, 'WALLET_ARCHIVED', 'Wallet is archived')
    }
    wallet.balance = addMoney(wallet.balance, amount)
    await wallet.save()
  }

  async decreaseBalance(walletId: string, amount: Money): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId)
    if (!wallet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'WALLET_NOT_FOUND', 'Wallet not found')
    }
    if (wallet.isArchived) {
      throw new ApiError(StatusCodes.CONFLICT, 'WALLET_ARCHIVED', 'Wallet is archived')
    }
    wallet.balance = subtractMoney(wallet.balance, amount)
    await wallet.save()
  }

  private requireOwnWallet(actorId: string, wallet: HydratedDocument<WalletDoc> | null): HydratedDocument<WalletDoc> {
    if (!wallet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'WALLET_NOT_FOUND', 'Wallet not found')
    }
    if (wallet.ownerId.toString() !== actorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You do not have access to this wallet')
    }
    return wallet
  }
}
