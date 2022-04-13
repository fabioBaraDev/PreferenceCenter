import { andThen, identity, pipe } from 'ramda'

import { Repositories } from '@/domain/model/repository'

import { Event, User, validateEmail } from '../../domain/model/entities'
import { rejectInvalidUser } from '../../domain/model/erros'

export interface EventService {
  upsert: (event: Event) => Promise<Event>
}

export interface UserService {
  upsert: (user: User) => Promise<User>
  delete: (email: string) => Promise<number>
  findUserByEmail: (email: string) => Promise<User>
  findUserById: (id: number) => Promise<User>
}

export interface Services {
  user: UserService
  event: EventService
}

export const buildUserService = (repository: Repositories): UserService => {
  const upsert = (user: User): Promise<User> =>
    pipe(validateEmail, repository.user.upsert, andThen(identity))(user)

  const del = (email: string): Promise<number> =>
    pipe(repository.user.deleteByEmail, andThen(identity))(email)

  const findUserByEmail = (email: string): Promise<User> =>
    repository.user.findByEmail(email)

  const findUserById = (id: number): Promise<User> =>
    repository.user.findById(id)

  return { upsert, delete: del, findUserByEmail, findUserById }
}

export const buildEventService = (repository: Repositories): EventService => {
  const eventHasValidUser = async (event: Event) => {
    const user = await repository.user.findById(event.user_id)

    if (user == undefined) {
      throw rejectInvalidUser()
    }
  }
  const upsert = async (event: Event): Promise<Event> => {
    await eventHasValidUser(event)
    const newEvent = await repository.event.upsert(event)
    await repository.event.insertHistory(event)

    return newEvent
  }

  return { upsert }
}

export const buildServices = (repository: Repositories): Services => ({
  user: buildUserService(repository),
  event: buildEventService(repository),
})
