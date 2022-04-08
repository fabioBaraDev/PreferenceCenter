import faker from 'faker'

import { HistoryEventType } from '@/../src/domain/model/value-objects'

import { EventPayload, UserPayload } from '../../../src/domain/model/repository'

export const userPayloadFactory = (): UserPayload => ({
  id: faker.datatype.number(),
  email: faker.datatype.string(),
  consents: [faker.datatype.string()],
})

export const eventPayloadFactory = (): EventPayload => ({
  user_id: faker.datatype.number(),
  type: HistoryEventType.SMS_NOTIFICATION,
  status: faker.datatype.boolean(),
})
