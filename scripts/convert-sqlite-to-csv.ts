/**
 * Script to convert SQLite database to CSV files
 * Run with: bun run scripts/convert-sqlite-to-csv.ts
 */

import { Database } from 'bun:sqlite';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const dbPath = join(__dirname, '../static/timeutcnow.db');
const outputDir = join(__dirname, '../static');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

// Open SQLite database
console.log('Opening SQLite database...');
const db = new Database(dbPath);

// Helper function to escape CSV values
function escapeCSV(value: any): string {
	if (value === null || value === undefined) {
		return '';
	}
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

// Convert cities to CSV
console.log('Converting cities to CSV...');
const cities = db.prepare('SELECT id, name, country, timezone, label, lat, lng FROM cities ORDER BY name').all() as any[];
const citiesCSV = [
	['id', 'name', 'country', 'timezone', 'label', 'lat', 'lng'].join(','),
	...cities.map(city => [
		escapeCSV(city.id),
		escapeCSV(city.name),
		escapeCSV(city.country),
		escapeCSV(city.timezone),
		escapeCSV(city.label),
		escapeCSV(city.lat),
		escapeCSV(city.lng)
	].join(','))
].join('\n');

writeFileSync(join(outputDir, 'cities.csv'), citiesCSV);
console.log(`✅ Created cities.csv with ${cities.length} cities`);

// Convert countries to CSV
console.log('Converting countries to CSV...');
const countries = db.prepare('SELECT code, name, primaryTimezone FROM countries ORDER BY name').all() as any[];
const countriesCSV = [
	['code', 'name', 'primaryTimezone'].join(','),
	...countries.map(country => [
		escapeCSV(country.code),
		escapeCSV(country.name),
		escapeCSV(country.primaryTimezone)
	].join(','))
].join('\n');

writeFileSync(join(outputDir, 'countries.csv'), countriesCSV);
console.log(`✅ Created countries.csv with ${countries.length} countries`);

// Convert timezones to CSV
console.log('Converting timezones to CSV...');
const timezones = db.prepare('SELECT iana, abbreviation, utcOffset, dstOffset, dstStart, dstEnd FROM timezones ORDER BY iana').all() as any[];
const timezonesCSV = [
	['iana', 'abbreviation', 'utcOffset', 'dstOffset', 'dstStart', 'dstEnd'].join(','),
	...timezones.map(tz => [
		escapeCSV(tz.iana),
		escapeCSV(tz.abbreviation),
		escapeCSV(tz.utcOffset),
		escapeCSV(tz.dstOffset),
		escapeCSV(tz.dstStart),
		escapeCSV(tz.dstEnd)
	].join(','))
].join('\n');

writeFileSync(join(outputDir, 'timezones.csv'), timezonesCSV);
console.log(`✅ Created timezones.csv with ${timezones.length} timezones`);

// Close database
db.close();

console.log('\n✨ Done! CSV files created in static/ folder:');
console.log('   - cities.csv');
console.log('   - countries.csv');
console.log('   - timezones.csv');
