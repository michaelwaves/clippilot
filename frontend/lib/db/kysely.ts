import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './types'
const dialect = new PostgresDialect({
    pool: new Pool({
        database: 'clippilot',
        host: 'database-3.cryyys8w6d1r.us-east-2.rds.amazonaws.com',
        user: 'postgres',
        port: 5432,
        max: 10,
        password: 'Clippilotiscool!1'
    })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<Database>({
    dialect,
})