import { Express } from 'express'
import { Knex } from 'knex'
import supertest from 'supertest'

import { User } from '@/domain/model/entities'
import database from '@/infrastructure/database'
import { getUserById } from '@/tests/helpers/cruds'
import { getEvents } from '@/tests/helpers/factories/event-payload'
import { clearDatabase } from '@/tests/helpers/infrastructure'

import { startupServer } from './../server/index'

describe('Presentation - User unit tests', () => {
  let db: Knex
  let request: supertest.SuperTest<supertest.Test>
  beforeAll(async () => {
    db = await database.connect()
    const app: Express = await startupServer()
    request = await supertest(app)
  })

  afterAll(async () => {
    await clearDatabase(db)
    database.close()
  })

  it('should post event to a user and return 200', async () => {
    const event = await getEvents(db)

    const payload = {
      user: {
        id: event[0].user_id,
      },
      consents: [
        {
          id: event[0].type,
          enabled: event[0].status,
        },
      ],
    }

    await request.post('/events').send(payload).expect(200)
    const dbRes: User = await getUserById(db, event[0].user_id)

    expect(event[0].user_id).toStrictEqual(dbRes.id)
  })
})
