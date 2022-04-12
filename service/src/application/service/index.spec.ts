import { Knex } from 'knex'
import { applyTo, pipe, prop, unary } from 'ramda'

import { User } from '@/domain/model/entities'
import { ERRORS_CODES } from '@/domain/model/erros'
import database from '@/infrastructure/database'
import { getUserByEmail, insertEvents } from '@/tests/helpers/cruds'
import {
  createUserWithEvents,
  getDataBaseUser,
  getEvents,
  getUserId,
  userPayloadFactory,
} from '@/tests/helpers/factories/event-payload'

import { buildRepositories } from '../../infrastructure/adapters/repository/postgres-repository'
import { buildUserService } from './index'

const buildUserServices = (trx: Knex.Transaction) =>
  pipe(buildRepositories, buildUserService)(trx)

describe('services test', () => {
  let db: Knex
  beforeAll(async () => {
    db = await database.connect()
  })

  describe('#USER TESTS', () => {
    const runUserUpsertService = async (user: User) =>
      await db.transaction(async (trx) => {
        const getService = unary(prop('upsert'))
        return pipe(buildUserServices, getService, applyTo(user))(trx)
      })

    it('should insert a user with a correct data', async () => {
      const user = userPayloadFactory()

      const serviceResponse = await runUserUpsertService(user)

      const createdUser = await getUserByEmail(db, user.email)

      expect(user.email).toStrictEqual(createdUser.email)
      expect(user.email).toStrictEqual(serviceResponse.email)
      expect(createdUser.id).not.toBeNull()
    })

    it('should not insert a user with a invalid email', async () => {
      const user = userPayloadFactory('NotAValidEmail')
      let isErrorCaught = false

      try {
        await runUserUpsertService(user)
      } catch (e: any) {
        if (e.name == ERRORS_CODES.NotValidEmail) {
          isErrorCaught = true
        }
      }
      expect(isErrorCaught).toStrictEqual(true)
    })

    it('should delete a user with a correct data', async () => {
      const user = await getDataBaseUser(db)

      await db.transaction(async (trx) => {
        const getService = unary(prop('delete'))
        return pipe(buildUserServices, getService, applyTo(user.email))(trx)
      })

      const createdUser = await getUserByEmail(db, user.email)

      expect(createdUser).toBeUndefined()
    })

    it('should find a user by id', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction(async (trx) => {
        const getService = unary(prop('findUserById'))
        const userId = getUserId(user)
        return pipe(buildUserServices, getService, applyTo(userId))(trx)
      })

      expect(foundUser.email).toStrictEqual(user.email)
      expect(foundUser.id).toStrictEqual(user.id)
    })

    it('should find a user by id with multiple events', async () => {
      const events = await getEvents(db)

      await insertEvents(db, events)

      const foundUser = await db.transaction(async (trx) => {
        const getService = unary(prop('findUserById'))
        const userId = events[0].user_id
        return pipe(buildUserServices, getService, applyTo(userId))(trx)
      })

      expect(foundUser.events.length).toStrictEqual(2)
      expect(foundUser.id).toStrictEqual(events[0].user_id)
    })

    it('should find a user by email', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction(async (trx) => {
        const getService = unary(prop('findUserByEmail'))
        return pipe(buildUserServices, getService, applyTo(user.email))(trx)
      })

      expect(foundUser[0].email).toStrictEqual(user.email)
      expect(foundUser[0].id).toStrictEqual(user.id)
    })

    it('should find a user by email multiple events', async () => {
      const user = await createUserWithEvents(db)

      const foundUser = await db.transaction(async (trx) => {
        const getService = unary(prop('findUserByEmail'))
        return pipe(buildUserServices, getService, applyTo(user.email))(trx)
      })

      expect(foundUser[0].events.length).toStrictEqual(2)
      expect(foundUser[0].id).toStrictEqual(user.id)
    })
  })
})
