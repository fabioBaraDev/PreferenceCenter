import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'

import { HistoryEventType } from '../../../domain/model/value-objects'

export const eventValidators = [
  body('user.id').isNumeric(),
  body('consents').isArray(),
  body('consents.*.enabled').isBoolean(),

  body('consents.*.id').custom((data) => {
    if (
      data != HistoryEventType.EMAIL_NOTIFICATIONS &&
      data != HistoryEventType.SMS_NOTIFICATION
    ) {
      return Promise.reject('Not a valid consent')
    }
    return true
  }),
]

export const inputHasValidData = (req: Request, res: Response): boolean => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}
