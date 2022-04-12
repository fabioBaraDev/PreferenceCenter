"use strict";

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

exports.up = async (db) => {
  await db.runSql(`
    CREATE TABLE "users" (
      "id" serial,
      "email" varchar,
      PRIMARY KEY ("id"),
      UNIQUE ("email")
    );
  `);
};

exports.down = async (db) => {
  await db.runSql(`
    DROP TABLE "users";
  `);
};

exports._meta = {
  version: 1,
};
