import { Knex } from 'knex'
import { applyTo, partial, pipe, prop, unary } from 'ramda'

import { User } from '@/domain/model/entities'
import { ERRORS_CODES } from '@/domain/model/erros'
import { EventPayload } from '@/domain/model/repository'
import database from '@/infrastructure/database'
import {
  getHistoricalEventByUserId,
  getUserByEmail,
  getUserByIdWithEvents,
  insertEvents,
} from '@/tests/helpers/cruds'
import {
  createUserWithEvents,
  getDataBaseUser,
  getEvents,
  getUserId,
  userPayloadFactory,
} from '@/tests/helpers/factories/event-payload'
import { clearDatabase } from '@/tests/helpers/infrastructure'

import { buildRepositories } from '../../infrastructure/adapters/repository/postgres-repository'
import { buildServices } from './index'

const buildUserServices = (trx: Knex.Transaction) =>
  pipe(buildRepositories, buildServices, unary(prop('user')))(trx)

const buildEventServices = (trx: Knex.Transaction) =>
  pipe(buildRepositories, buildServices, unary(prop('event')))(trx)

const getUserUpsertService = unary(prop('upsert'))
const getUserDeleteService = unary(prop('delete'))
const getFindUserByIdService = unary(prop('findUserById'))
const getFindUserByEmailService = unary(prop('findUserByEmail'))
const getEventUpsertService = unary(prop('upsert'))

const executeHistoricalServiceTransaction = async (
  db: Knex,
  eventSmsAndEmailPayload: EventPayload
) =>
  db.transaction(
    pipe(
      buildEventServices,
      getEventUpsertService,
      applyTo(eventSmsAndEmailPayload)
    )
  )

describe('services test', () => {
  let db: Knex
  beforeAll(async () => {
    db = await database.connect()
  })

  beforeEach(() => clearDatabase(db))

  afterAll(() => database.close())

  describe('#USER TESTS', () => {
    const runUserUpsertService = async (user: User) =>
      db.transaction(
        pipe(buildUserServices, getUserUpsertService, applyTo(user))
      )

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

      await db.transaction(
        pipe(buildUserServices, getUserDeleteService, applyTo(user.email))
      )

      const createdUser = await getUserByEmail(db, user.email)

      expect(createdUser).toBeUndefined()
    })

    it('should find a user by id', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction(
        pipe(
          buildUserServices,
          getFindUserByIdService,
          applyTo(getUserId(user))
        )
      )

      expect(foundUser.email).toStrictEqual(user.email)
      expect(foundUser.id).toStrictEqual(user.id)
    })

    it('should find a user by id with multiple events', async () => {
      const events = await getEvents(db)

      await insertEvents(db, events)

      const foundUser = await db.transaction(
        pipe(
          buildUserServices,
          getFindUserByIdService,
          applyTo(events[0].user_id)
        )
      )

      expect(foundUser.events.length).toStrictEqual(2)
      expect(foundUser.id).toStrictEqual(events[0].user_id)
    })

    it('should find a user by email', async () => {
      const user = await getDataBaseUser(db)

      const foundUser = await db.transaction(
        pipe(buildUserServices, getFindUserByEmailService, applyTo(user.email))
      )

      expect(foundUser.email).toStrictEqual(user.email)
      expect(foundUser.id).toStrictEqual(user.id)
    })

    it('should find a user by email multiple events', async () => {
      const user = await createUserWithEvents(db)

      const foundUser = await db.transaction(
        pipe(buildUserServices, getFindUserByEmailService, applyTo(user.email))
      )

      expect(foundUser.events.length).toStrictEqual(2)
      expect(foundUser.id).toStrictEqual(user.id)
    })
  })

  describe('#EVENT TESTS', () => {
    it('should insert a event with a correct data', async () => {
      const eventSmsAndEmailPayload = await getEvents(db)
      const singleEventPayload = eventSmsAndEmailPayload[0]

      await executeHistoricalServiceTransaction(db, singleEventPayload)

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

      const transactionPromises = eventSmsAndEmailPayload.map(
        partial(executeHistoricalServiceTransaction, [db])
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

      await executeHistoricalServiceTransaction(db, eventSmsAndEmailPayload[0])
      await executeHistoricalServiceTransaction(db, eventSmsAndEmailPayload[1])
      await executeHistoricalServiceTransaction(db, eventSmsAndEmailPayload[0])

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
