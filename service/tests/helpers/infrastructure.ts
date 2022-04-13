import { Knex } from 'knex'

export const clearDatabase = (knex: Knex): Promise<void> =>
  knex
    .raw(
      `
      DO $$ DECLARE
      r RECORD;
      BEGIN
        FOR r IN (
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename NOT LIKE '%migrations%'
          AND tableowner IN (SELECT current_user)
        ) LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
      `
    )
    .then()
