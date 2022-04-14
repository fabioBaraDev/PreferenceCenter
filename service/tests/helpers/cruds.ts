import { Knex } from 'knex'

import { User } from '@/../src/domain/model/entities'
import { UserPayload } from '@/domain/model/repository'

import { HistoryEvents } from './../../src/domain/model/entities'
import { EventPayload } from './../../src/domain/model/repository'

export const getUserByEmail = (db: Knex, email: string): Promise<User> =>
  db('users').where('email', '=', email).first()

export const getUserById = (db: Knex, id: number): Promise<User> =>
  db('users').where('id', '=', id).first()

export const getUserByIdWithEvents = (db: Knex, id: number): Promise<User> =>
  db
    .select(
      'u.id as id',
      'u.email as email',
      db.raw(
        `json_agg(json_build_object('id', e.id, 'user_id', e.user_id, 'type', e.type, 'status', e.status) ORDER BY e.id) as events`
      )
    )
    .from('users as u')
    .leftJoin('events as e', 'u.id', '=', 'e.user_id')
    .where('u.id', id)
    .groupBy('u.id', 'u.email')
    .first()

export const getUsersByEmail = (db: Knex, email: string): Promise<User[]> =>
  db
    .select(
      'u.id as id',
      'u.email as email',
      db.raw(
        `json_agg(json_build_object('id', e.id, 'user_id', e.user_id, 'type', e.type, 'status', e.status)) as events`
      )
    )
    .from('users as u')
    .leftJoin('events as e', 'u.id', '=', 'e.user_id')
    .where('u.email', '=', email)
    .groupBy('u.id', 'u.email')

export const getHistoricalEventByUserId = (
  db: Knex,
  id: number
): Promise<HistoryEvents[]> =>
  db('history_events').select('*').where('user_id', id)

export const insertUser = (db: Knex, user: UserPayload): Promise<User> =>
  db('users')
    .insert({ email: user.email })
    .returning('*')
    .then(([payload]) => payload)

export const insertEvents = (db: Knex, events: EventPayload[]): Promise<void> =>
  db('events').insert(events)
