import faker from 'faker'

import { HistoryEventType } from '@/../src/domain/model/value-objects'

import { EventPayload, UserPayload } from '../../../src/domain/model/repository'

export const userPayloadFactory = (): UserPayload => ({
  id: faker.datatype.number(),
  email: faker.internet.email(),
})

export const eventPayloadFactory = (
  user_id?: number,
  type?: HistoryEventType
): EventPayload => ({
  user_id: user_id ?? faker.datatype.number(),
  type: type ?? HistoryEventType.SMS_NOTIFICATION,
  status: faker.datatype.boolean(),
})
