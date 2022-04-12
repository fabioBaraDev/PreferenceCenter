export enum ERRORS_CODES {
  NotValidEmail = 'NotValidEmailError',
}

export const rejectInvalidEmail = (): never => {
  throw InvalidEmailError()
}

const InvalidEmailError = (): Error => ({
  name: ERRORS_CODES.NotValidEmail,
  message: 'The email data is not valid',
})
