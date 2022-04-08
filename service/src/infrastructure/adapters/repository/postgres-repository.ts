import { Knex } from 'knex'

import { Event, HistoryEvents, User } from '../../../domain/model/entities'
import {
  DatabaseRepository,
  EventPayload,
  EventRepository,
  UserPayload,
  UserRepository,
} from './../../../domain/model/repository'

const userRepository = (knex: Knex.Transaction): UserRepository => {
  const upsert = async (payload: UserPayload): Promise<User> =>
    knex('users')
      .insert({
        email: payload.email,
      })
      .returning(['id', 'email'])

  const del = async (payload: UserPayload): Promise<void[]> =>
    knex('users').where(payload).del()

  const findById = async (id: number): Promise<User> =>
    knex('users').select('id', 'email').where('id', id).first()

  const findByEmail = async (email: string): Promise<User[]> =>
    knex('users').select('id', 'email').where('email', email)

  return { upsert, delete: del, findById, findByEmail }
}

const eventRepository = (knex: Knex.Transaction): EventRepository => {
  const upsert = (payload: EventPayload): Promise<Event> =>
    knex('events')
      .insert(payload)
      .returning(['id', 'user_id', 'type', 'status'])

  const insertHistory = (payload: EventPayload): Promise<HistoryEvents> =>
    knex('history_events')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        status: payload.status,
      })
      .returning(['id', 'user_id', 'type', 'status'])

  return { upsert, insertHistory }
}

export const buildRepositories = (
  knex: Knex.Transaction
): DatabaseRepository => ({
  user: userRepository(knex),
  event: eventRepository(knex),
})
