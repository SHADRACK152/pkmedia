
import pg from 'pg';
const { Pool } = pg;

async function checkDb() {
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
    
    console.log("Querying users table...");
    const res = await client.query('SELECT * FROM users LIMIT 1');
    console.log(`Found ${res.rows.length} users.`);
    if (res.rows.length > 0) {
      console.log("First user:", res.rows[0].username, res.rows[0].role);
    }

    console.log("Querying session table...");
    const sessionRes = await client.query('SELECT * FROM session LIMIT 1');
    console.log(`Found ${sessionRes.rows.length} sessions.`);

    client.release();
  } catch (err) {
    console.error("Database check failed:", err);
  } finally {
    await pool.end();
  }
}

checkDb();
