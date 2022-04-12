import { Knex } from 'knex'

import { Event, HistoryEvents, User } from '../../../domain/model/entities'
import {
  EventRepository,
  Repositories,
  UserRepository,
} from './../../../domain/model/repository'

const userRepository = (knex: Knex.Transaction): UserRepository => {
  const upsert = async (payload: User): Promise<User> => {
    const res = await knex('users')
      .insert({
        email: payload.email,
      })
      .returning(['id', 'email'])
      .onConflict(['email'])
      .merge()

    return res[0]
  }

  const del = async (email: string): Promise<void[]> =>
    knex('users').where('email', email).del()

  const findById = async (id: number): Promise<User> =>
    knex
      .select(
        'u.id as id',
        'u.email as email',
        knex.raw(
          `json_agg(json_build_object('id', e.id, 'user_id', e.user_id, 'type', e.type, 'status', e.status)) as events`
        )
      )
      .from('users as u')
      .leftJoin('events as e', 'u.id', '=', 'e.user_id')
      .where('u.id', '=', id)
      .groupBy('u.id', 'u.email')
      .first()

  const findByEmail = async (email: string): Promise<User> =>
    knex
      .select(
        'u.id as id',
        'u.email as email',
        knex.raw(
          `json_agg(json_build_object('id', e.id, 'user_id', e.user_id, 'type', e.type, 'status', e.status)) as events`
        )
      )
      .from('users as u')
      .leftJoin('events as e', 'u.id', '=', 'e.user_id')
      .where('u.email', email)
      .groupBy('u.id', 'u.email')
      .first()

  return { upsert, deleteByEmail: del, findById, findByEmail }
}

const eventRepository = (knex: Knex.Transaction): EventRepository => {
  const upsert = (payload: Event): Promise<Event> =>
    knex('events')
      .insert(payload)
      .onConflict(['user_id', 'type'])
      .merge()
      .returning(['id', 'user_id', 'type', 'status'])
      .then((rows) => rows[0])

  const insertHistory = (payload: Event): Promise<HistoryEvents> =>
    knex('history_events')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        status: payload.status,
      })
      .returning(['id', 'user_id', 'type', 'status'])

  return { upsert, insertHistory }
}

export const buildRepositories = (knex: Knex.Transaction): Repositories => ({
  user: userRepository(knex),
  event: eventRepository(knex),
})
