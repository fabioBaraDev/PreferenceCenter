import { Knex } from 'knex'

import db from './database'

export type Infrastructure = Readonly<{
  database: Knex
}>

export const connect = (): Promise<Infrastructure> =>
  Promise.resolve(db.connect()).then((database) => ({
    database,
  }))

export const disconnect = (): Promise<void> => db.close()
