'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = (options, seedLink) => {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async db => {

  await db.runSql(`
    CREATE TABLE "events" (
      "id" serial,
      "user_id" int NOT NULL,
      "email" varchar,
      PRIMARY KEY ("id"),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
};

exports.down = async db => {
  await db.runSql(`
    DROP TABLE "events";
  `)
};

exports._meta = {
  "version": 1
};