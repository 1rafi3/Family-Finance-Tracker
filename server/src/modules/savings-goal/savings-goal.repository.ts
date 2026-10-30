import mongoose from 'mongoose'
import type { SavingsGoal } from '@family-finance/shared'
import { SavingsGoalModel } from '../../models/savings-goal.js'
import type { SavingsGoalCreateData, SavingsGoalUpdateData } from './savings-goal.types.js'

export class SavingsGoalRepository {
  async listByOwner(ownerId: string, includeArchived = false): Promise<SavingsGoal[]> {
    const filter: Record<string, unknown> = {
      ownerId: new mongoose.Types.ObjectId(ownerId),
    }
    if (!includeArchived) {
      filter.isArchived = false
    }

    const docs = await SavingsGoalModel.find(filter).sort({ createdAt: -1 }).lean({ virtuals: false })

    return docs.map((doc) => this.serialize(doc))
  }

  async findByIdAndOwner(id: string, ownerId: string): Promise<SavingsGoal | null> {
    const doc = await SavingsGoalModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    }).lean({ virtuals: false })

    return doc ? this.serialize(doc) : null
  }

  async create(data: SavingsGoalCreateData): Promise<SavingsGoal> {
    const doc = await SavingsGoalModel.create({
      ownerId: new mongoose.Types.ObjectId(data.ownerId),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? '0.00',
      currency: data.currency,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      status: data.status,
      notes: data.notes ?? undefined,
      isArchived: false,
      createdBy: new mongoose.Types.ObjectId(data.ownerId),
    })

    return this.serialize(doc.toJSON() as Record<string, unknown>)
  }

  async update(id: string, ownerId: string, data: SavingsGoalUpdateData): Promise<SavingsGoal | null> {
    const updateFields: Record<string, unknown> = { updatedBy: new mongoose.Types.ObjectId(ownerId) }

    if (data.name !== undefined) updateFields.name = data.name
    if (data.targetAmount !== undefined) updateFields.targetAmount = data.targetAmount
    if (data.currentAmount !== undefined) updateFields.currentAmount = data.currentAmount
    if (data.currency !== undefined) updateFields.currency = data.currency
    if (data.deadline !== undefined) updateFields.deadline = data.deadline ? new Date(data.deadline) : null
    if (data.status !== undefined) updateFields.status = data.status
    if (data.notes !== undefined) updateFields.notes = data.notes ?? null

    const doc = await SavingsGoalModel.findOneAndUpdate(
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
    await SavingsGoalModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        ownerId: new mongoose.Types.ObjectId(ownerId),
      },
      { $set: { isArchived: true } },
    )
  }

  private serialize(doc: Record<string, unknown>): SavingsGoal {
    const { _id, __v, ownerId, createdBy, updatedBy, deadline, ...rest } = doc as Record<string, unknown> & {
      _id?: unknown; __v?: unknown; ownerId?: unknown; createdBy?: unknown; updatedBy?: unknown; deadline?: Date | null
    }
    return {
      id: _id ? String(_id) : String((doc as Record<string, unknown>).id ?? ''),
      ownerId: String(ownerId ?? ''),
      createdBy: createdBy ? String(createdBy) : undefined,
      updatedBy: updatedBy ? String(updatedBy) : undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
      ...rest,
    } as SavingsGoal
  }
}
