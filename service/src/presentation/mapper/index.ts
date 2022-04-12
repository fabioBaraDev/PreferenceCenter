import { Request } from 'express'

import { Event, User } from './../../../src/domain/model/entities'

export const userMapper = (req: Request): User => ({
  email: req.body.email,
  events: [],
})

export const getEventMapper = (req: Request): Event[] => {
  return req.body.consents.map((row: any) => {
    return {
      user_id: req.body.user.id,
      type: row.id,
      status: row.enabled,
    }
  })
}
