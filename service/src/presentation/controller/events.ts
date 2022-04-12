import { Request, Response, Router } from 'express'
import { Knex } from 'knex'
import { andThen, applyTo, pipe, prop, unary } from 'ramda'

import { Infrastructure } from '@/infrastructure'

import { buildEventService } from '../../application/service'
import { buildRepositories } from '../../infrastructure/adapters/repository/postgres-repository'
import { getEventMapper } from '../mapper'
import { Event } from './../../../src/domain/model/entities'

const insertedMsg = (event: Event) =>
  Object.freeze(
    `Consent with type: ${event.type} to user with id: ${event.user_id} inserted successfully`
  )

const sendResponse = (res: Response) => (serviceResponse: Event) =>
  res.status(200).send(insertedMsg(serviceResponse))

const buildService = (trx: Knex.Transaction) =>
  pipe(buildRepositories, buildEventService)(trx)

export const EventController = async (
  infra: Infrastructure,
  router: Router
): Promise<void> => {
  router.post('/events', async (req: Request, res: Response) => {
    const getService = unary(prop('upsert'))

    const executeService = (trx: Knex.Transaction) => async (event: Event) =>
      await pipe(
        buildService,
        getService,
        applyTo(event),
        andThen(sendResponse(res))
      )(trx)

    try {
      infra.database.transaction(async (trx) => {
        await Promise.all(getEventMapper(req).map(executeService(trx)))
      })
    } catch (e) {
      res.status(400).send(e)
    }
  })
}
