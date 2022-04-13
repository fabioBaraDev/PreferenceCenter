import { Event, HistoryEvents, User } from './entities'
import { HistoryEventType } from './value-objects'

export type UserPayload = {
  id?: number
  email: string
}

export type EventPayload = {
  user_id: number
  type: HistoryEventType
  status: boolean
}

export interface UserRepository {
  upsert: (payload: User) => Promise<User>
  deleteByEmail: (email: string) => Promise<number>
  findById: (id: number) => Promise<User>
  findByEmail: (email: string) => Promise<User>
}

export interface EventRepository {
  upsert: (payload: Event) => Promise<Event>
  insertHistory: (payload: Event) => Promise<HistoryEvents>
}

export interface Repositories {
  user: UserRepository
  event: EventRepository
}
