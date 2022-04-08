import { Knex } from 'knex'
import { andThen, identity, partial, pipe } from 'ramda'

import { User } from '@/domain/model/entities'
import { DatabaseRepository, EventPayload } from '@/domain/model/repository'
import database from '@/infrastructure/database'

import {
  getUserByEmail,
  getUserByIdWithEvents,
} from '../../../../tests/helpers/cruds'
import { clearDatabase } from '../../../../tests/helpers/infrastructure'
import { insertUser } from './../../../../tests/helpers/cruds'
import {
  eventPayloadFactory,
  userPayloadFactory,
} from './../../../../tests/helpers/factories/event-payload'
import { buildRepositories } from './postgres-repository'

const getUserId = (user: User) => (user.id ? user.id : 0)

const getDataBaseUser = (db: Knex): Promise<User> =>
  pipe(userPayloadFactory, partial(insertUser, [db]), andThen(identity))()

const getDataBaseEvent = (db: Knex): Promise<EventPayload> =>
  pipe(getDataBaseUser, andThen(pipe(getUserId, eventPayloadFactory)))(db)

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
    })

    it('should delete a user with a correct data', async () => {
      const user = await getDataBaseUser(db)

      await db.transaction((trx) => repository(trx).user.deleteByEmail(user))

      const createdUser = await getUserByEmail(db, user.email)

      expect(createdUser).toBeUndefined()
    })

    it('should find a user by id', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction((trx) =>
        repository(trx).user.findById(getUserId(user))
      )

      expect(foundUser.email).toStrictEqual(user.email)
      expect(foundUser.id).toStrictEqual(user.id)
    })

    it('should find a user by email', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction((trx) =>
        repository(trx).user.findByEmail(user.email)
      )

      expect(foundUser[0].email).toStrictEqual(user.email)
      expect(foundUser[0].id).toStrictEqual(user.id)
    })
  })

  describe('#EVENT TESTS', () => {
    it('should insert a event with a correct data', async () => {
      const eventPayload = await getDataBaseEvent(db)

      await db.transaction((trx) => repository(trx).event.upsert(eventPayload))

      const createdUserWithEvent = await getUserByIdWithEvents(
        db,
        eventPayload.user_id
      )

      expect(eventPayload.status).toStrictEqual(
        createdUserWithEvent.events?.[0].status
      )

      expect(eventPayload.user_id).toStrictEqual(
        createdUserWithEvent.events?.[0].user_id
      )
      expect(eventPayload.type).toStrictEqual(
        createdUserWithEvent.events?.[0].type
      )
    })
  })
})
