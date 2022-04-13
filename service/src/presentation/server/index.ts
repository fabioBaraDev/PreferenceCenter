import bodyParser from 'body-parser'
import express, { Express } from 'express'

import { EventController } from '../controller/events-controller'
import { UserController } from '../controller/user-controller'
import { connect as connectInfrastructure } from './../../infrastructure'

export const startupServer = (): Express => {
  const app: Express = express()

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  const port = 8080

  app.listen(port, async () => {
    const infra = await connectInfrastructure()
    const router = express.Router()
    await UserController(infra, router)
    await EventController(infra, router)
    app.use('/', router)
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
  })
  return app
}
