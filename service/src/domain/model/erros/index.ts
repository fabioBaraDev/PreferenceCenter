export enum ERRORS_CODES {
  NotValidEmail = '1',
}

export const rejectInvalidEmail = (): never => {
  throw InvalidEmailError()
}

const InvalidEmailError = (): Error => ({
  name: ERRORS_CODES.NotValidEmail,
  message: 'Error: the email data is not valid',
})
