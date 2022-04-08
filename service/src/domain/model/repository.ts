import { Event, HistoryEvents, User } from './entities'
import { HistoryEventType } from './value-objects'

export type UserPayload = {
  id?: number
  email: string
  consents?: [string]
}

export type EventPayload = {
  user_id: number
  type: HistoryEventType
  status: boolean
}

export interface UserRepository {
  upsert: (payload: UserPayload) => Promise<User>
  delete: (payload: UserPayload) => Promise<void[]>
  findById: (id: number) => Promise<User>
  findByEmail: (email: string) => Promise<User[]>
}

export interface EventRepository {
  upsert: (payload: EventPayload) => Promise<Event>
  insertHistory: (payload: EventPayload) => Promise<HistoryEvents>
}

export interface DatabaseRepository {
  user: UserRepository
  event: EventRepository
}
