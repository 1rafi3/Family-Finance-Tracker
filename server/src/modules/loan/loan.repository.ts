import mongoose from 'mongoose'
import { LoanStatus, type Loan } from '@family-finance/shared'
import { LoanModel } from '../../models/loan.js'
import type { LoanCreateData, LoanUpdateData } from './loan.types.js'

export class LoanRepository {
  async listByOwner(ownerId: string, includeArchived = false): Promise<Loan[]> {
    const filter: Record<string, unknown> = {
      ownerId: new mongoose.Types.ObjectId(ownerId),
    }
    if (!includeArchived) {
      filter.isArchived = false
    }

    const docs = await LoanModel.find(filter).sort({ createdAt: -1 }).lean({ virtuals: false })
    return docs.map((doc) => this.serialize(doc))
  }

  async findByIdAndOwner(id: string, ownerId: string): Promise<Loan | null> {
    const doc = await LoanModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    }).lean({ virtuals: false })

    return doc ? this.serialize(doc) : null
  }

  async create(data: LoanCreateData): Promise<Loan> {
    const remaining = data.remainingBalance != null
      ? data.remainingBalance
      : data.principal

    const doc = await LoanModel.create({
      ownerId: new mongoose.Types.ObjectId(data.ownerId),
      direction: data.direction,
      counterpartyName: data.counterpartyName,
      principal: data.principal,
      interestRate: data.interestRate ?? undefined,
      currency: data.currency,
      termMonths: data.termMonths ?? undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      remainingBalance: remaining,
      status: Number(remaining) <= 0 ? LoanStatus.PAID : data.status,
      notes: data.notes ?? undefined,
      isArchived: false,
      createdBy: new mongoose.Types.ObjectId(data.ownerId),
    })

    return this.serialize(doc.toJSON() as Record<string, unknown>)
  }

  async update(id: string, ownerId: string, data: LoanUpdateData): Promise<Loan | null> {
    const updateFields: Record<string, unknown> = { updatedBy: new mongoose.Types.ObjectId(ownerId) }

    if (data.direction !== undefined) updateFields.direction = data.direction
    if (data.counterpartyName !== undefined) updateFields.counterpartyName = data.counterpartyName
    if (data.principal !== undefined) updateFields.principal = data.principal
    if (data.interestRate !== undefined) updateFields.interestRate = data.interestRate ?? null
    if (data.currency !== undefined) updateFields.currency = data.currency
    if (data.termMonths !== undefined) updateFields.termMonths = data.termMonths ?? null
    if (data.dueDate !== undefined) updateFields.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.remainingBalance !== undefined) {
      updateFields.remainingBalance = data.remainingBalance
      if (Number(data.remainingBalance) <= 0 && data.status === undefined) {
        updateFields.status = LoanStatus.PAID
      }
    }
    if (data.status !== undefined) updateFields.status = data.status
    if (data.notes !== undefined) updateFields.notes = data.notes ?? null

    const doc = await LoanModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        ownerId: new mongoose.Types.ObjectId(ownerId),
      },
      { $set: updateFields },
      { new: true },
    ).lean({ virtuals: false })

    return doc ? this.serialize(doc) : null
  }

  async archive(id: string, ownerId: string): Promise<void> {
    await LoanModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        ownerId: new mongoose.Types.ObjectId(ownerId),
      },
      { $set: { isArchived: true } },
    )
  }

  private serialize(doc: Record<string, unknown>): Loan {
    const { _id, __v, ownerId, createdBy, updatedBy, dueDate, ...rest } = doc as Record<string, unknown> & {
      _id?: unknown; __v?: unknown; ownerId?: unknown; createdBy?: unknown; updatedBy?: unknown; dueDate?: Date | null
    }
    return {
      id: _id ? String(_id) : String((doc as Record<string, unknown>).id ?? ''),
      ownerId: String(ownerId ?? ''),
      createdBy: createdBy ? String(createdBy) : undefined,
      updatedBy: updatedBy ? String(updatedBy) : undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      ...rest,
    } as Loan
  }
}
