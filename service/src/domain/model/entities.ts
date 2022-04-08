import { HistoryEventType } from './value-objects'

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
