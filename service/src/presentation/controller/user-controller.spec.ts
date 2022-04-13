import { Express } from 'express'
import { Knex } from 'knex'
import supertest from 'supertest'

import { User } from '@/domain/model/entities'
import database from '@/infrastructure/database'
import { getUsersByEmail } from '@/tests/helpers/cruds'
import {
  getDataBaseUser,
  userPayloadFactory,
} from '@/tests/helpers/factories/event-payload'
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

  it('should get user and return 200', async () => {
    const user = await getDataBaseUser(db)
    const res = await request.get('/users/' + user.email)
    expect(res.status).toStrictEqual(200)
  })

  it('should delete user and return 202', async () => {
    const user = await getDataBaseUser(db)
    const res = await request.delete('/users/' + user.email)
    expect(res.status).toStrictEqual(202)
  })
  it('should post user and return 200', async () => {
    const user = userPayloadFactory()
    await request.post('/users').send(user).expect(200)
    const dbRes: User[] = await getUsersByEmail(db, user.email)

    expect(user.email).toStrictEqual(dbRes[0].email)
  })
})
