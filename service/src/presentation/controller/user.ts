import { Request, Response, Router } from 'express'
import { Knex } from 'knex'
import { andThen, applyTo, pipe, prop, unary } from 'ramda'

import { Infrastructure } from '@/infrastructure'

import { buildUserService } from '../../application/service'
import { buildRepositories } from '../../infrastructure/adapters/repository/postgres-repository'
import { userMapper } from '../mapper'
import { User } from './../../../src/domain/model/entities'

const insertedMsg = (email: string) =>
  Object.freeze(`User with email: ${email} inserted successfully`)

const deletedMsg = (email: string) =>
  Object.freeze(`User with email: ${email} deleted successfully`)

const sendResponse = (res: Response) => (serviceResponse: User) =>
  res.status(200).send(insertedMsg(serviceResponse.email))

const sendUserObjectToResponse = (res: Response) => (user: User) =>
  res.status(200).send(user)

const buildService = (trx: Knex.Transaction) =>
  pipe(buildRepositories, buildUserService)(trx)

export const UserController = async (
  infra: Infrastructure,
  router: Router
): Promise<void> => {
  router.get('/users/:email', async (req: Request, res: Response) => {
    const { email } = req.params
    const getService = unary(prop('findUserByEmail'))
    infra.database.transaction(async (trx) => {
      await pipe(
        buildService,
        getService,
        applyTo(email),
        andThen(sendUserObjectToResponse(res))
      )(trx)
    })
  })

  router.post('/users', async (req: Request, res: Response) => {
    const user = userMapper(req)

    const getService = unary(prop('upsert'))

    infra.database.transaction(async (trx) => {
      try {
        await pipe(
          buildService,
          getService,
          applyTo(user),
          andThen(sendResponse(res))
        )(trx)
      } catch (e) {
        res.status(400).send(e)
      }
    })
  })

  router.delete('/users/:email', async (req: Request, res: Response) => {
    const { email } = req.params

    const getService = unary(prop('delete'))
    const sendDeleteMsgToResponse = () =>
      res.status(202).send(deletedMsg(email))

    infra.database.transaction(
      await pipe(
        buildService,
        getService,
        applyTo(email),
        andThen(sendDeleteMsgToResponse)
      )
    )
  })
}