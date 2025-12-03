
import pg from 'pg';
const { Pool } = pg;

async function createSessionTable() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
