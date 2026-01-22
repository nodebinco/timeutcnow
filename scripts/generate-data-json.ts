/**
 * Generate JSON data file from SQLite database for browser migration
 * Run with: bun run scripts/generate-data-json.ts
 */

import { Database } from 'bun:sqlite';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const dbPath = join(__dirname, '../static/timeutcnow.db');
const outputPath = join(__dirname, '../static/data.json');

// Open SQLite database
console.log('Opening SQLite database...');
const db = new Database(dbPath);

// Read all data
console.log('Reading data from database...');
const cities = db.prepare('SELECT * FROM cities').all();
const countries = db.prepare('SELECT * FROM countries').all();
const timezones = db.prepare('SELECT * FROM timezones').all();

// Transform data to match expected format
const transformedData = {
	cities: cities.map((row: any) => ({
		id: row.id,
		name: row.name,
		country: row.country,
		timezone: row.timezone,
		label: row.label || undefined,
		coordinates: row.lat && row.lng ? {
			lat: row.lat,
			lng: row.lng
		} : undefined
	})),
	countries: countries.map((row: any) => ({
		code: row.code,
		name: row.name,
		primaryTimezone: row.primaryTimezone || undefined
	})),
	timezones: timezones.map((row: any) => ({
		iana: row.iana,
		abbreviation: row.abbreviation,
		utcOffset: row.utcOffset,
		dstOffset: row.dstOffset || undefined,
		dstStart: row.dstStart || undefined,
		dstEnd: row.dstEnd || undefined
	}))
};

// Write JSON file
console.log(`Writing JSON file with ${transformedData.cities.length} cities, ${transformedData.countries.length} countries, ${transformedData.timezones.length} timezones...`);
writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));

console.log(`✅ JSON file created: ${outputPath}`);

// Close database
db.close();
