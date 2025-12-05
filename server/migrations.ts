import { db } from './server/db.ts';
import fs from 'fs';
import { sql } from 'drizzle-orm';

async function runStartupMigrations() {
  try {
    console.log('Running startup migrations...');
    
    const migrationSql = fs.readFileSync('migrations/005_add_tags_safe.sql', 'utf8');
    await db.execute(sql.raw(migrationSql));
    
    console.log('✓ Migrations completed successfully');
  } catch (err: any) {
    console.error('Migration error:', err.message);
    // Don't fail the app if migrations fail - log and continue
  }
}

export { runStartupMigrations };
