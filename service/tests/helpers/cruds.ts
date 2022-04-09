import { Knex } from 'knex'

import { User } from '@/../src/domain/model/entities'
import { UserPayload } from '@/domain/model/repository'

export const getUserByEmail = (db: Knex, email: string): Promise<User> =>
  db('users').where('email', '=', email).first()

//knex('accounts').jsonSet('json_col', '$.name', { "name": "newName" }, 'newNameCol')

export const getUserByIdWithEvents = (db: Knex, id: number): Promise<User> =>
  db
    .select(
      'u.id as id',
      db.raw(
        `json_agg(json_build_object('id', e.id, 'user_id', e.user_id, 'type', e.type, 'status', e.status)) as events`
      ),
      'u.email as email'
    )
    .from('users as u')
    .leftJoin('events as e', 'u.id', '=', 'e.user_id')
    .where('u.id', '=', id)
    .groupBy('u.id', 'u.email')
    .first()

export const insertUser = (db: Knex, user: UserPayload): Promise<User> =>
  db('users')
    .insert({ email: user.email })
    .returning('*')
    .then(([payload]) => payload)