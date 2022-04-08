export const database = {
  connection: process.env.DATABASE_URL,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN as string) || 1,
    max: parseInt(process.env.DB_POOL_MAX as string) || 500,
  },
  acquireConnectionTimeout:
    parseInt(process.env.DB_ACQUIRE_CONNECTION_TIMEOUT as string) || 30000,
} as const
