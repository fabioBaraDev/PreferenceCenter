import { User } from './entities'

export type UserPayload = {
  email: string
  consents?: [string]
}

export type EventPayload = {
  id: number
  city?: string
  province_code?: string
}

export interface UserRepository {
  upsert: (payload: UserPayload) => Promise<User>
  delete: (payload: UserPayload) => Promise<void[]>
  findById: (id: number) => Promise<User>
  findByEmail: (email: string) => Promise<User[]>
}

export interface EventRepository {
  upsert: (payload: EventPayload) => Promise<Event>
}
