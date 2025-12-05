import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'newsletter_subscribers'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Table exists: newsletter_subscribers');
    } else {
      console.log('✗ Table does NOT exist: newsletter_subscribers');
    }
    
    // Also check columns
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'newsletter_subscribers'
      ORDER BY ordinal_position
    `);
    
    if (columns.rows.length > 0) {
      console.log('\nColumns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();
