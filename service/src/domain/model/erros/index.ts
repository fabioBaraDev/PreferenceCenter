export enum ERRORS_CODES {
  NotValidEmail = 'NotValidEmailError',
  NotValidUser = 'The user is not valid',
}

const InvalidEmailError = (): Error => ({
  name: ERRORS_CODES.NotValidEmail,
  message: 'The email data is not valid',
})

const InvalidUserError = (): Error => ({
  name: ERRORS_CODES.NotValidUser,
  message: 'The user data is not valid',
})

export const rejectInvalidEmail = (): never => {
  throw InvalidEmailError()
}
export const rejectInvalidUser = (): never => {
  throw InvalidUserError()
}
