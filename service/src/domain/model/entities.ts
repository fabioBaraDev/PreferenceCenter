import { always, ifElse, pipe } from 'ramda'

import { rejectInvalidEmail } from './erros/index'
import { HistoryEventType } from './value-objects'

const REGEX_EMAIL_EXPRESSION =
  /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export type User = Readonly<{
  id?: number
  email: string
  events: Event[]
}>

export type Event = Readonly<{
  id?: number
  user_id: number
  type: HistoryEventType
  status: boolean
}>

export type HistoryEvents = Readonly<{
  id?: number
  user_id: number
  updatedAt: Date
  type: HistoryEventType
  status: boolean
}>

export const validateEmail = (user: User): User =>
  pipe(ifElse(isValidEmail, always(user), rejectInvalidEmail))(user)

const isValidEmail = (user: User): boolean =>
  REGEX_EMAIL_EXPRESSION.test(user.email)
