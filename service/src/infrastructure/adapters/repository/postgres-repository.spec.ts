import { Knex } from 'knex'

import { DatabaseRepository } from '@/domain/model/repository'
import database from '@/infrastructure/database'

import { getUserByEmail } from '../../../../tests/helpers/cruds'
import { clearDatabase } from '../../../../tests/helpers/infrastructure'
import { userPayloadFactory } from './../../../../tests/helpers/factories/event-payload'
import { buildRepositories } from './postgres-repository'

describe('postgres-repository test', () => {
  let db: Knex
  let repository: (knex: Knex.Transaction) => DatabaseRepository

  beforeAll(async () => {
    db = await database.connect()
    repository = buildRepositories
  })

  beforeEach(() => clearDatabase(db))

  afterAll(() => database.close())

  describe('#USER TESTS', () => {
    it('should insert a user with a correct data', async () => {
      const user = userPayloadFactory()

      await db.transaction((trx) => repository(trx).user.upsert(user))

      const createdUser = await getUserByEmail(db, user.email)

      expect(user.email).toStrictEqual(createdUser.email)
      expect(createdUser.id).not.toBeNull()
      expect(createdUser.events).toStrictEqual(createdUser.events)
    })
  })
})
