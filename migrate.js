import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration...');
    
    const sql = fs.readFileSync('migrations/006_add_article_images_array.sql', 'utf8');
    await client.query(sql);
    
    console.log('✓ Migration completed successfully!');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
