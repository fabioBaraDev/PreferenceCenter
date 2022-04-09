import { Knex } from 'knex'
import { always, andThen, identity, partial, pipe } from 'ramda'

import { User } from '@/domain/model/entities'
import { DatabaseRepository, EventPayload } from '@/domain/model/repository'
import { HistoryEventType } from '@/domain/model/value-objects'
import database from '@/infrastructure/database'

import {
  getHistoricalEventByUserId,
  getUserByEmail,
  getUserByIdWithEvents,
  insertEvents,
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

const createEmailEvent = (userId: number) =>
  eventPayloadFactory(userId, HistoryEventType.EMAIL_NOTIFICATIONS)

const createSMSEvent = (userId: number) =>
  eventPayloadFactory(userId, HistoryEventType.SMS_NOTIFICATION)

const createEvents = (user: User) => {
  const userId = getUserId(user)

  return [createSMSEvent(userId), createEmailEvent(userId)]
}

const getEvents = (db: Knex): Promise<EventPayload[]> =>
  pipe(getDataBaseUser, andThen(createEvents))(db)

const createUserWithEvents = async (db: Knex): Promise<User> => {
  const getUser = always(await getDataBaseUser(db))

  return await pipe(
    getUser,
    pipe(createEvents, partial(insertEvents, [db])),
    andThen(identity),
    getUser
  )()
}

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

    it('should find a user by id with multiple events', async () => {
      const events = await getEvents(db)

      await insertEvents(db, events)

      const foundUser = await db.transaction((trx) =>
        repository(trx).user.findById(events[0].user_id)
      )

      expect(foundUser.events.length).toStrictEqual(2)
      expect(foundUser.id).toStrictEqual(events[0].user_id)
    })

    it('should find a user by email', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction((trx) =>
        repository(trx).user.findByEmail(user.email)
      )

      expect(foundUser[0].email).toStrictEqual(user.email)
      expect(foundUser[0].id).toStrictEqual(user.id)
    })

    it('should find a user by email multiple events', async () => {
      const user = await createUserWithEvents(db)

      const foundUser = await db.transaction((trx) =>
        repository(trx).user.findByEmail(user.email)
      )

      expect(foundUser[0].events.length).toStrictEqual(2)
      expect(foundUser[0].id).toStrictEqual(user.id)
    })
  })

  describe('#EVENT TESTS', () => {
    it('should insert a event with a correct data', async () => {
      const eventSmsAndEmailPayload = await getEvents(db)
      const singleEventPayload = eventSmsAndEmailPayload[0]

      await db.transaction((trx) =>
        repository(trx).event.upsert(singleEventPayload)
      )

      const createdUserWithEvent = await getUserByIdWithEvents(
        db,
        singleEventPayload.user_id
      )

      expect(singleEventPayload.status).toStrictEqual(
        createdUserWithEvent.events?.[0].status
      )

      expect(singleEventPayload.user_id).toStrictEqual(
        createdUserWithEvent.events?.[0].user_id
      )
      expect(singleEventPayload.type).toStrictEqual(
        createdUserWithEvent.events?.[0].type
      )
    })

    it('should insert a event with multiple types', async () => {
      const eventSmsAndEmailPayload = await getEvents(db)

      const transactionPromises = eventSmsAndEmailPayload.map((row) =>
        db.transaction((trx) => repository(trx).event.upsert(row))
      )

      await Promise.all(transactionPromises)

      const createdUserWithEvent = await getUserByIdWithEvents(
        db,
        eventSmsAndEmailPayload[0].user_id
      )

      for (let index = 0; index < eventSmsAndEmailPayload.length; index++) {
        expect(eventSmsAndEmailPayload[index].status).toStrictEqual(
          createdUserWithEvent.events?.[index].status
        )
        expect(eventSmsAndEmailPayload[index].user_id).toStrictEqual(
          createdUserWithEvent.events?.[index].user_id
        )
        expect(eventSmsAndEmailPayload[index].type).toStrictEqual(
          createdUserWithEvent.events?.[index].type
        )
      }
    })

    it('should insert a historical change event', async () => {
      const eventSmsAndEmailPayload = await getEvents(db)

      await db.transaction((trx) =>
        repository(trx).event.upsert(eventSmsAndEmailPayload[0])
      )

      await db.transaction((trx) =>
        repository(trx).event.insertHistory(eventSmsAndEmailPayload[0])
      )

      await db.transaction((trx) =>
        repository(trx).event.upsert(eventSmsAndEmailPayload[1])
      )

      await db.transaction((trx) =>
        repository(trx).event.insertHistory(eventSmsAndEmailPayload[1])
      )

      await db.transaction((trx) =>
        repository(trx).event.upsert(eventSmsAndEmailPayload[0])
      )

      await db.transaction((trx) =>
        repository(trx).event.insertHistory(eventSmsAndEmailPayload[0])
      )

      const createdUserWithEvent = await getUserByIdWithEvents(
        db,
        eventSmsAndEmailPayload[0].user_id
      )

      const histData = await getHistoricalEventByUserId(
        db,
        eventSmsAndEmailPayload[0].user_id
      )
      expect(createdUserWithEvent.events?.length).toStrictEqual(2)
      expect(histData.length).toStrictEqual(3)
    })
  })
})
