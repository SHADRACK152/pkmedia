// Temporary script to run the push subscriptions migration
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString);

try {
  console.log('Running migration: 002_create_push_subscriptions_table.sql');
  
  const migrationSQL = readFileSync(
    join(__dirname, 'migrations', '002_create_push_subscriptions_table.sql'),
    'utf-8'
  );
  
  await sql.unsafe(migrationSQL);
  
  console.log('✅ Migration completed successfully!');
  console.log('Push subscriptions table created.');
  
  // Verify table was created
  const result = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = 'push_subscriptions'
  `;
  
  if (result.length > 0) {
    console.log('✅ Verified: push_subscriptions table exists');
  } else {
    console.log('⚠️  Warning: Could not verify table creation');
  }
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}
