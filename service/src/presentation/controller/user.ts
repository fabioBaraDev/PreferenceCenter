import { Request, Response, Router } from 'express'
import { Knex } from 'knex'
import { andThen, applyTo, ifElse, pipe, prop, unary } from 'ramda'

import { Infrastructure } from '@/infrastructure'

import { buildUserService } from '../../application/service'
import { buildRepositories } from '../../infrastructure/adapters/repository/postgres-repository'
import { userMapper } from '../mapper'
import { User } from './../../../src/domain/model/entities'

const insertedMsg = (serviceResponse: User) =>
  Object.freeze(
    `User with email: ${serviceResponse.email} and ID: ${serviceResponse.id}    inserted successfully`
  )

const deletedMsg = (email: string) =>
  Object.freeze(`User with email: ${email} deleted successfully`)

const NOT_FOUND_USER_MSG = Object.freeze('User not found')

const sendResponse = (res: Response) => (serviceResponse: User) =>
  res.status(200).send(insertedMsg(serviceResponse))

const sendUserObjectToResponse = (res: Response) => (user: User) => {
  if (isUserValid(user)) {
    res.status(200).send(user)
  } else {
    res.status(404).send(NOT_FOUND_USER_MSG)
  }
}

const isUserValid = (serviceResponse: User) => serviceResponse != undefined

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
        res.status(422).send(e)
      }
    })
  })

  router.delete('/users/:email', async (req: Request, res: Response) => {
    const { email } = req.params

    const getService = unary(prop('delete'))

    const sendDeleteMsgToResponse = (deletedAmout: number) => {
      const dataHasBeenDeleted = () => deletedAmout > 0
      const deleteSucessMessage = () => res.status(202).send(deletedMsg(email))
      const deleteErrorMessage = () => res.status(404).send(NOT_FOUND_USER_MSG)

      ifElse(dataHasBeenDeleted, deleteSucessMessage, deleteErrorMessage)()
    }

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
