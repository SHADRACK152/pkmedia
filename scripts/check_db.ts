
import pg from 'pg';
import { getDatabaseUrl } from '../server/database-config.js';
const { Pool } = pg;

async function checkDb() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
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
