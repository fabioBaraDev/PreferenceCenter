import { Knex, knex } from 'knex'

import { database as config } from '../../config'
import singleton from '../../utils/lazy-singleton'

const newKnex = () =>
  knex({
    client: 'pg',
    ...config,
  })

const pool = singleton(newKnex)

const connect = (): Promise<Knex> => Promise.resolve(pool.get())

const close = (): Promise<void> => {
  const conn = pool.get()
  return conn ? conn.destroy().then(pool.dispose) : Promise.resolve()
}

export default {
  connect,
  close,
}
