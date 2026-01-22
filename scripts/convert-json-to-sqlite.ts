/**
 * Script to convert JSON data files to SQLite database file
 * Run with: bun run scripts/convert-json-to-sqlite.ts
 */

import { Database } from 'bun:sqlite';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths - Note: src/lib/data has been removed, so we'll create a backup data folder for the script
const dataDir = join(__dirname, '../data-backup');
const outputDir = join(__dirname, '../static');
const dbPath = join(outputDir, 'timeutcnow.db');

// Check if data-backup exists, if not, create it from a backup or skip
if (!require('fs').existsSync(dataDir)) {
	console.error('Error: data-backup folder not found. Please restore data files or update the script.');
	process.exit(1);
}

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

// Create SQLite database
console.log('Creating SQLite database...');
const db = new Database(dbPath);

// Enable foreign keys and optimize
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');

// Create tables
console.log('Creating tables...');
db.run(`
	CREATE TABLE IF NOT EXISTS cities (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		country TEXT NOT NULL,
		timezone TEXT NOT NULL,
		label TEXT,
		lat REAL,
		lng REAL
	)
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_cities_timezone ON cities(timezone)`);

db.run(`
	CREATE TABLE IF NOT EXISTS countries (
		code TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		primaryTimezone TEXT
	)
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name)`);

db.run(`
	CREATE TABLE IF NOT EXISTS timezones (
		iana TEXT PRIMARY KEY,
		abbreviation TEXT NOT NULL,
		utcOffset INTEGER NOT NULL,
		dstOffset INTEGER,
		dstStart TEXT,
		dstEnd TEXT
	)
`);

// Prepare insert statements
const insertCity = db.prepare(`
	INSERT OR REPLACE INTO cities (id, name, country, timezone, label, lat, lng)
	VALUES ($id, $name, $country, $timezone, $label, $lat, $lng)
`);

const insertCountry = db.prepare(`
	INSERT OR REPLACE INTO countries (code, name, primaryTimezone)
	VALUES ($code, $name, $primaryTimezone)
`);

const insertTimezone = db.prepare(`
	INSERT OR REPLACE INTO timezones (iana, abbreviation, utcOffset, dstOffset, dstStart, dstEnd)
	VALUES ($iana, $abbreviation, $utcOffset, $dstOffset, $dstStart, $dstEnd)
`);

// Load and insert cities
console.log('Loading cities...');
// Load all cities from cities.json first, then load from cities/ folder
let citiesData: any[] = [];

// Load from cities/ folder (this is the main source)
const citiesFolder = join(dataDir, 'cities');
const fs = await import('fs');
const files = fs.readdirSync(citiesFolder).filter(f => f.endsWith('.json') && f !== 'index.ts');
for (const file of files) {
	try {
		const countryCities = JSON.parse(readFileSync(join(citiesFolder, file), 'utf-8'));
		citiesData.push(...countryCities);
	} catch (e) {
		console.warn(`Failed to load ${file}:`, e);
	}
}

// Also load from cities.json if it exists (might have additional cities)
try {
	const citiesJson = JSON.parse(readFileSync(join(dataDir, 'cities.json'), 'utf-8'));
	// Only add cities that don't already exist (by id)
	const existingIds = new Set(citiesData.map(c => c.id));
	const newCities = citiesJson.filter((c: any) => !existingIds.has(c.id));
	citiesData.push(...newCities);
	if (newCities.length > 0) {
		console.log(`Added ${newCities.length} additional cities from cities.json`);
	}
} catch (e) {
	// cities.json doesn't exist, that's fine
}

console.log(`Found ${citiesData.length} cities total`);
console.log(`Inserting ${citiesData.length} cities...`);

const insertCitiesBatch = db.transaction((cities: any[]) => {
	for (const city of cities) {
		insertCity.run({
			$id: city.id,
			$name: city.name,
			$country: city.country,
			$timezone: city.timezone,
			$label: city.label || null,
			$lat: city.coordinates?.lat || null,
			$lng: city.coordinates?.lng || null
		});
	}
});

// Insert in batches for better performance
const batchSize = 100;
for (let i = 0; i < citiesData.length; i += batchSize) {
	const batch = citiesData.slice(i, i + batchSize);
	insertCitiesBatch(batch);
	console.log(`Inserted ${Math.min(i + batchSize, citiesData.length)}/${citiesData.length} cities`);
}

// Load and insert countries
console.log('Loading countries...');
const countriesData = JSON.parse(readFileSync(join(dataDir, 'countries.json'), 'utf-8'));
console.log(`Inserting ${countriesData.length} countries...`);

const insertCountriesBatch = db.transaction((countries: any[]) => {
	for (const country of countries) {
		insertCountry.run({
			$code: country.code,
			$name: country.name,
			$primaryTimezone: country.primaryTimezone || null
		});
	}
});

insertCountriesBatch(countriesData);

// Load and insert timezones
console.log('Loading timezones...');
const timezonesData = JSON.parse(readFileSync(join(dataDir, 'timezones.json'), 'utf-8'));
console.log(`Inserting ${timezonesData.length} timezones...`);

const insertTimezonesBatch = db.transaction((timezones: any[]) => {
	for (const tz of timezones) {
		insertTimezone.run({
			$iana: tz.iana,
			$abbreviation: tz.abbreviation,
			$utcOffset: tz.utcOffset,
			$dstOffset: tz.dstOffset || null,
			$dstStart: tz.dstStart || null,
			$dstEnd: tz.dstEnd || null
		});
	}
});

insertTimezonesBatch(timezonesData);

// Get statistics
const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number };
const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number };
const timezoneCount = db.prepare('SELECT COUNT(*) as count FROM timezones').get() as { count: number };

console.log('\n✅ Database created successfully!');
console.log(`📊 Statistics:`);
console.log(`   Cities: ${cityCount.count}`);
console.log(`   Countries: ${countryCount.count}`);
console.log(`   Timezones: ${timezoneCount.count}`);
console.log(`\n📁 Database file: ${dbPath}`);

// Checkpoint WAL to merge all changes into main database file
console.log('🔄 Checkpointing WAL...');
db.run('PRAGMA wal_checkpoint(FULL)');

// Close database
db.close();

console.log('\n✨ Done!');
