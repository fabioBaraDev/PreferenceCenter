import { Knex } from 'knex'

import { User } from '@/../src/domain/model/entities'

export const getUserByEmail = (db: Knex, email: string): Promise<User> =>
  db('users').where('email', '=', email).first()
