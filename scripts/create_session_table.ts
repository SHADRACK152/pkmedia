
import pg from 'pg';
import { getDatabaseUrl } from '../server/database-config.js';
const { Pool } = pg;

async function createSessionTable() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
  });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    
    console.log("Checking if session table exists...");
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session'
      );
    `);

    if (res.rows[0].exists) {
      console.log("Session table already exists.");
    } else {
      console.log("Creating session table...");
      await client.query(`
        CREATE TABLE "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        )
        WITH (OIDS=FALSE);

        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

        CREATE INDEX "IDX_session_expire" ON "session" ("expire");
      `);
      console.log("Session table created successfully.");
    }

    client.release();
  } catch (err) {
    console.error("Error creating session table:", err);
  } finally {
    await pool.end();
  }
}

createSessionTable();
