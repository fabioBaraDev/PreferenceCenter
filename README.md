# Preference Center

This project provides a backend solution to a Preference Center for your users where they can manage their choice regarding the channel they want to get notified on.

## Technical stack

#### Requirements

To run this project you must have installed the following programs:

- NodeJs 16.14.2
- NPM 8.5.0
- Docker
- Postman
- The preferable OS is Linux or MacOs, this project has linux/macOs commands to startup

#### Technologies

- This is project has been developed using functional programming paradigm
- This project has a hexagonal architecture structure
- TypeScript
- NodeJs
- Rambda
- Express
- Knex
- Docker
- Postgres
- db-migrate
- Jest
- supertest

## DataBase Objects

![image](https://user-images.githubusercontent.com/56052145/163487409-9cf7beb7-3088-4e80-abdb-7d242b69df9d.png)

## How to run

There is a **Makefile file in the project root folder**, any command that you need to performe, you may find in there to help you

#### Migrations

- This project has a migration structure, with this library you can apply changes to the database, to create, apply or rollback a migration, you can run the following commands:

`make migrations/dependencies/install`

`make migrations/create`

`make migrations/apply`

`make migrations/rollback`

#### Unit tests

**To run unit tests** follow the commands below:

- You must have the localhost docker online
- second, you must open your terminal at the root project folder
- run the following command

`make tests`

This command will startup the database at docker and run the unit tests integrated with it

#### Running at localhost

**To run the software** follow the commands below:

- You must have the localhost docker online
- second, you must open your terminal at the root project folder
- run the following command

`make startup`

- To perform the tests you must use the postman collection at the root folder, in this file you may find the REST Http endpoints related to this project

- POST: /users
- DELETE: /users
- GET: /users

- POST: /events

#### Aditional information:

- as a good pratice I preferered a number type at the user id
- to be attend to this demand: 'Consent change events can only be read and created', I prefered to have an updatable event table with the current event data status (as the event data grows, this table will have a better performance without a historical data), and a historical table to store the history events

Hope you like it .. :)
Thanks
