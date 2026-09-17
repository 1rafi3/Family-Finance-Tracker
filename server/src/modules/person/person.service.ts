import { ApiError } from '../../utils/ApiError.js'
import type { CreatePersonInput, Id, UpdatePersonInput } from '@family-finance/shared'
import { PersonRepository } from './person.repository.js'

export class PersonService {
  constructor(private readonly personRepo: PersonRepository = new PersonRepository()) {}

  async listPeople(ownerId: Id, includeArchived = false) {
    const people = await this.personRepo.listByOwner(ownerId, includeArchived)
    const spendingStats = await this.personRepo.getSpendingSummary(ownerId)

    const statsMap = new Map<string, { totalSpent: number; txCount: number }>()
    spendingStats.forEach((s) => statsMap.set(s.personId, s))

    return people.map((person) => {
      const p = person.toJSON() as Record<string, unknown>
      const personId = String(person._id)
      const stats = statsMap.get(personId) ?? { totalSpent: 0, txCount: 0 }
      return {
        ...p,
        id: personId,
        totalSpent: stats.totalSpent,
        transactionCount: stats.txCount,
      }
    })
  }

  async getPerson(id: Id, ownerId: Id) {
    const person = await this.personRepo.findByIdAndOwner(id, ownerId)
    if (!person) {
      throw ApiError.notFound('Person profile not found')
    }
    return person
  }

  async createPerson(ownerId: Id, data: CreatePersonInput) {
    const existing = await this.personRepo.findByNameAndOwner(ownerId, data.name)
    if (existing) {
      throw ApiError.conflict(`A profile with the name '${data.name}' already exists`)
    }

    return this.personRepo.createPerson({
      ...data,
      ownerId,
      createdBy: ownerId,
    })
  }

  async updatePerson(id: Id, ownerId: Id, data: UpdatePersonInput) {
    const person = await this.getPerson(id, ownerId)

    if (data.name && data.name.toLowerCase() !== person.name.toLowerCase()) {
      const existing = await this.personRepo.findByNameAndOwner(ownerId, data.name)
      if (existing) {
        throw ApiError.conflict(`A profile with the name '${data.name}' already exists`)
      }
    }

    const updated = await this.personRepo.updatePerson(id, ownerId, {
      ...data,
      updatedBy: ownerId,
    })

    if (!updated) {
      throw ApiError.notFound('Person profile not found for update')
    }
    return updated
  }

  async archivePerson(id: Id, ownerId: Id) {
    await this.getPerson(id, ownerId)
    return this.personRepo.archivePerson(id, ownerId)
  }
}
