/**
 * IndexedDB utilities for timezone data (cities, countries, timezones)
 * Loads data from CSV files on first visit
 */

import type { City, Country, Timezone } from '$lib/types/timezone';

export const DB_NAME = 'timeutcnow';
export const DB_VERSION = 2; // Increment version to add new stores
export const STORES = {
	CITIES: 'cities',
	COUNTRIES: 'countries',
	TIMEZONES: 'timezones',
	USER_PREFERENCES: 'user_preferences'
};

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return dbInstance;
	}

	// Check if IndexedDB is available
	if (!indexedDB) {
		throw new Error('IndexedDB is not supported in this browser');
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = (event) => {
			const error = (event.target as IDBOpenDBRequest).error;
			console.error('IndexedDB open error:', error);
			reject(new Error(`Failed to open IndexedDB: ${error?.message || 'Unknown error'}`));
		};

		request.onsuccess = () => {
			dbInstance = request.result;
			
			// Handle database errors
			dbInstance.onerror = (event) => {
				console.error('IndexedDB error:', event);
			};
			
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			try {
				// Create object stores if they don't exist
				if (!db.objectStoreNames.contains(STORES.CITIES)) {
					const cityStore = db.createObjectStore(STORES.CITIES, { keyPath: 'id' });
					cityStore.createIndex('name', 'name', { unique: false });
					cityStore.createIndex('country', 'country', { unique: false });
					cityStore.createIndex('timezone', 'timezone', { unique: false });
				}

				if (!db.objectStoreNames.contains(STORES.COUNTRIES)) {
					const countryStore = db.createObjectStore(STORES.COUNTRIES, { keyPath: 'code' });
					countryStore.createIndex('name', 'name', { unique: false });
				}

			if (!db.objectStoreNames.contains(STORES.TIMEZONES)) {
				const timezoneStore = db.createObjectStore(STORES.TIMEZONES, { keyPath: 'iana' });
				timezoneStore.createIndex('abbreviation', 'abbreviation', { unique: false });
			}

			if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
				const prefsStore = db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
				prefsStore.createIndex('timestamp', 'timestamp', { unique: false });
			}
		} catch (error) {
			console.error('Error creating object stores:', error);
			reject(error);
		}
		};

		request.onblocked = () => {
			console.warn('IndexedDB open is blocked. Please close other tabs using this database.');
		};
	});
}

/**
 * Check if data exists in IndexedDB
 */
async function hasData(): Promise<boolean> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.CITIES], 'readonly');
		const store = transaction.objectStore(STORES.CITIES);
		const countRequest = store.count();
		
		return new Promise((resolve) => {
			countRequest.onsuccess = () => {
				const count = countRequest.result;
				console.log(`🔍 hasData: Found ${count} cities in IndexedDB`);
				resolve(count > 0);
			};
			countRequest.onerror = (event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ hasData count error:', error);
				resolve(false);
			};
		});
	} catch (error) {
		console.error('❌ hasData: Exception:', error);
		return false;
	}
}

/**
 * Parse CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				current += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	result.push(current);
	return result;
}

/**
 * Load CSV file and parse it
 */
async function loadCSV(url: string): Promise<string[][]> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load CSV: ${url}`);
	}
	const text = await response.text();
	const lines = text.split('\n').filter(line => line.trim());
	const headers = parseCSVLine(lines[0]);
	const rows = lines.slice(1).map(line => parseCSVLine(line));
	return [headers, ...rows];
}

/**
 * Load cities from CSV and insert into IndexedDB
 */
async function loadCitiesFromCSV(): Promise<void> {
	console.log('📥 Loading cities from CSV...');
	const [headers, ...rows] = await loadCSV('/cities.csv');
	
	const db = await initDB();
	const transaction = db.transaction([STORES.CITIES], 'readwrite');
	const store = transaction.objectStore(STORES.CITIES);

	let count = 0;
	for (const row of rows) {
		if (row.length < headers.length) continue;
		
		const city: City = {
			id: row[0] || '',
			name: row[1] || '',
			country: row[2] || '',
			timezone: row[3] || '',
			label: row[4] || '',
			coordinates: (row[5] && row[6] && row[5] !== '' && row[6] !== '') ? {
				lat: parseFloat(row[5]),
				lng: parseFloat(row[6])
			} : undefined
		};

		try {
			store.put(city);
			count++;
			
			// Log progress every 100 cities
			if (count % 100 === 0) {
				console.log(`  ⏳ Loaded ${count} cities...`);
			}
		} catch (error) {
			console.error(`Error inserting city ${city.id}:`, error);
		}
	}

	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => {
			console.log(`✅ Loaded ${count} cities into IndexedDB`);
			resolve();
		};
		transaction.onerror = (event) => {
			const error = (event.target as IDBTransaction).error;
			console.error('Transaction error:', error);
			reject(new Error(`Failed to save cities to IndexedDB: ${error?.message || 'Unknown error'}`));
		};
		transaction.onabort = () => {
			reject(new Error('Transaction aborted'));
		};
	});
}

/**
 * Load countries from CSV and insert into IndexedDB
 */
async function loadCountriesFromCSV(): Promise<void> {
	console.log('📥 Loading countries from CSV...');
	const [headers, ...rows] = await loadCSV('/countries.csv');
	
	const db = await initDB();
	const transaction = db.transaction([STORES.COUNTRIES], 'readwrite');
	const store = transaction.objectStore(STORES.COUNTRIES);

	let count = 0;
	for (const row of rows) {
		if (row.length < headers.length) continue;
		
		const country: Country = {
			code: row[0] || '',
			name: row[1] || '',
			primaryTimezone: row[2] || ''
		};

		store.put(country);
		count++;
	}

	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => {
			console.log(`✅ Loaded ${count} countries into IndexedDB`);
			resolve();
		};
		transaction.onerror = (event) => {
			const error = (event.target as IDBTransaction).error;
			console.error('Transaction error:', error);
			reject(new Error(`Failed to save countries to IndexedDB: ${error?.message || 'Unknown error'}`));
		};
		transaction.onabort = () => {
			reject(new Error('Transaction aborted'));
		};
	});
}

/**
 * Load timezones from CSV and insert into IndexedDB
 */
async function loadTimezonesFromCSV(): Promise<void> {
	console.log('📥 Loading timezones from CSV...');
	const [headers, ...rows] = await loadCSV('/timezones.csv');
	
	const db = await initDB();
	const transaction = db.transaction([STORES.TIMEZONES], 'readwrite');
	const store = transaction.objectStore(STORES.TIMEZONES);

	let count = 0;
	for (const row of rows) {
		if (row.length < headers.length) continue;
		
		const timezone: Timezone = {
			iana: row[0] || '',
			abbreviation: row[1] || '',
			utcOffset: parseFloat(row[2]) || 0,
			dstOffset: row[3] ? parseFloat(row[3]) : undefined,
			dstStart: row[4] || undefined,
			dstEnd: row[5] || undefined
		};

		store.put(timezone);
		count++;
	}

	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => {
			console.log(`✅ Loaded ${count} timezones into IndexedDB`);
			resolve();
		};
		transaction.onerror = (event) => {
			const error = (event.target as IDBTransaction).error;
			console.error('Transaction error:', error);
			reject(new Error(`Failed to save timezones to IndexedDB: ${error?.message || 'Unknown error'}`));
		};
		transaction.onabort = () => {
			reject(new Error('Transaction aborted'));
		};
	});
}

/**
 * Load all data from CSV files if IndexedDB is empty
 */
export async function loadDataFromCSVIfNeeded(): Promise<void> {
	const hasDataInDB = await hasData();
	if (hasDataInDB) {
		console.log('✅ Data already exists in IndexedDB');
		return;
	}

	console.log('📦 IndexedDB is empty, loading data from CSV files...');
	
	try {
		await Promise.all([
			loadCitiesFromCSV(),
			loadCountriesFromCSV(),
			loadTimezonesFromCSV()
		]);
		console.log('🎉 All data loaded successfully!');
	} catch (error) {
		console.error('❌ Failed to load data from CSV:', error);
		throw error;
	}
}

/**
 * Get all cities from IndexedDB
 */
export async function getAllCities(): Promise<City[]> {
	try {
		console.log('📖 getAllCities: Opening IndexedDB...');
		const db = await initDB();
		const transaction = db.transaction([STORES.CITIES], 'readonly');
		const store = transaction.objectStore(STORES.CITIES);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				const cities = request.result as City[];
				console.log(`✅ getAllCities: Retrieved ${cities.length} cities from IndexedDB`);
				resolve(cities);
			};
			request.onerror = (event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getAllCities error:', error);
				reject(new Error(`Failed to get cities from IndexedDB: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ getAllCities: Exception:', error);
		throw error;
	}
}

/**
 * Get all countries from IndexedDB
 */
export async function getAllCountries(): Promise<Country[]> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.COUNTRIES], 'readonly');
		const store = transaction.objectStore(STORES.COUNTRIES);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				const countries = request.result as Country[];
				console.log(`✅ getAllCountries: Retrieved ${countries.length} countries from IndexedDB`);
				resolve(countries);
			};
			request.onerror = (event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getAllCountries error:', error);
				reject(new Error(`Failed to get countries from IndexedDB: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ getAllCountries: Exception:', error);
		throw error;
	}
}

/**
 * Get all timezones from IndexedDB
 */
export async function getAllTimezones(): Promise<Timezone[]> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.TIMEZONES], 'readonly');
		const store = transaction.objectStore(STORES.TIMEZONES);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				const timezones = request.result as Timezone[];
				console.log(`✅ getAllTimezones: Retrieved ${timezones.length} timezones from IndexedDB`);
				resolve(timezones);
			};
			request.onerror = (event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getAllTimezones error:', error);
				reject(new Error(`Failed to get timezones from IndexedDB: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ getAllTimezones: Exception:', error);
		throw error;
	}
}

/**
 * Get cities by IDs
 */
export async function getCitiesByIds(ids: string[]): Promise<City[]> {
	if (ids.length === 0) {
		return [];
	}

	const db = await initDB();
	const transaction = db.transaction([STORES.CITIES], 'readonly');
	const store = transaction.objectStore(STORES.CITIES);

	const cities: City[] = [];
	let completed = 0;

	return new Promise((resolve, reject) => {
		for (const id of ids) {
			const request = store.get(id);
			request.onsuccess = () => {
				if (request.result) {
					cities.push(request.result as City);
				}
				completed++;
				if (completed === ids.length) {
					resolve(cities);
				}
			};
			request.onerror = () => {
				completed++;
				if (completed === ids.length) {
					resolve(cities);
				}
			};
		}
	});
}

/**
 * Search cities in IndexedDB
 */
export async function searchCities(query: string, countryNames?: Map<string, string>): Promise<City[]> {
	if (!query || !query.trim()) {
		return getAllCities();
	}

	const allCities = await getAllCities();
	const lowerQuery = query.toLowerCase().trim();

	return allCities.filter(city => {
		const cityNameMatch = city.name?.toLowerCase().includes(lowerQuery) || false;
		const labelMatch = city.label?.toLowerCase().includes(lowerQuery) || false;
		const timezoneMatch = city.timezone?.toLowerCase().includes(lowerQuery) || false;
		const countryMatch = countryNames 
			? countryNames.get(city.country)?.toLowerCase().includes(lowerQuery) || false
			: city.country?.toLowerCase().includes(lowerQuery) || false;

		return cityNameMatch || labelMatch || timezoneMatch || countryMatch;
	});
}
