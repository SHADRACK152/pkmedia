import { db } from './server/db.ts';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';

async function runMigrations() {
  const migrations = [
    '003_add_article_tags.sql',
    '004_create_tags_table.sql'
  ];

  for (const file of migrations) {
    const migrationSql = fs.readFileSync(path.join('migrations', file), 'utf8');
    console.log(`Running ${file}...`);
    
    try {
      await db.execute(sql.raw(migrationSql));
      console.log(`✓ ${file} completed`);
    } catch (err) {
      console.error(`✗ ${file} failed:`, err.message);
    }
  }
  
  console.log('\nMigrations completed!');
  process.exit(0);
}

runMigrations();
