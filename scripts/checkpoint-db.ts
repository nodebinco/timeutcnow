/**
 * Script to checkpoint WAL file and merge into main database
 * Run with: bun run scripts/checkpoint-db.ts
 */

import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../static/timeutcnow.db');

console.log('Opening database...');
const db = new Database(dbPath);

console.log('Checkpointing WAL...');
db.run('PRAGMA wal_checkpoint(FULL)');

// Verify data
const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number };
const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number };
const timezoneCount = db.prepare('SELECT COUNT(*) as count FROM timezones').get() as { count: number };

console.log(`\n📊 Database statistics:`);
console.log(`   Cities: ${cityCount.count}`);
console.log(`   Countries: ${countryCount.count}`);
console.log(`   Timezones: ${timezoneCount.count}`);

db.close();

console.log('\n✅ Checkpoint completed!');
