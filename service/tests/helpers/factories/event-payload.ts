import faker from 'faker'
import { Knex } from 'knex'
import { always, andThen, identity, partial, pipe } from 'ramda'

import { HistoryEventType } from '@/../src/domain/model/value-objects'
import { Event, User } from '@/domain/model/entities'
import { EventPayload } from '@/domain/model/repository'

import { insertEvents, insertUser } from '../cruds'

export const userPayloadFactory = (email?: string): User => ({
  id: faker.datatype.number(),
  email: email ?? faker.internet.email(),
  events: [],
})

export const eventPayloadFactory = (
  user_id?: number,
  type?: HistoryEventType
): Event => ({
  user_id: user_id ?? faker.datatype.number(),
  type: type ?? HistoryEventType.SMS_NOTIFICATION,
  status: faker.datatype.boolean(),
})

export const getUserId = (user: User): number => (user.id ? user.id : 0)

export const getDataBaseUser = (db: Knex): Promise<User> =>
  pipe(userPayloadFactory, partial(insertUser, [db]), andThen(identity))()

export const createEmailEvent = (userId: number): Event =>
  eventPayloadFactory(userId, HistoryEventType.EMAIL_NOTIFICATIONS)

export const createSMSEvent = (userId: number): Event =>
  eventPayloadFactory(userId, HistoryEventType.SMS_NOTIFICATION)

export const createEvents = (user: User): Event[] => {
  const userId = getUserId(user)

  return [createSMSEvent(userId), createEmailEvent(userId)]
}

export const getEvents = (db: Knex): Promise<EventPayload[]> =>
  pipe(getDataBaseUser, andThen(createEvents))(db)

export const createUserWithEvents = async (db: Knex): Promise<User> => {
  const getUser = always(await getDataBaseUser(db))

  return await pipe(
    getUser,
    pipe(createEvents, partial(insertEvents, [db])),
    andThen(identity),
    getUser
  )()
}
