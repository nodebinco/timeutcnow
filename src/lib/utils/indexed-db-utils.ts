import type { City, Country, Timezone, UserPreferences, WidgetConfig, MeetingConverterPreferences } from '$lib/types/timezone';
import { getAllCities } from '$lib/data/cities/index';
import countriesData from '$lib/data/countries.json';
import timezonesData from '$lib/data/timezones.json';

const DB_NAME = 'timeutcnow';
const DB_VERSION = 1;

const STORES = {
	TIMEZONE_DATA: 'timezoneData',
	USER_PREFERENCES: 'userPreferences',
	WIDGET_CONFIGS: 'widgetConfigs'
} as const;

interface DB {
	db: IDBDatabase | null;
}

let dbInstance: DB = { db: null };

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
	if (dbInstance.db) {
		return dbInstance.db;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			dbInstance.db = request.result;
			resolve(request.result);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Create object stores if they don't exist
			if (!db.objectStoreNames.contains(STORES.TIMEZONE_DATA)) {
				db.createObjectStore(STORES.TIMEZONE_DATA, { keyPath: 'type' });
			}
			if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
				db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(STORES.WIDGET_CONFIGS)) {
				db.createObjectStore(STORES.WIDGET_CONFIGS, { keyPath: 'id' });
			}
		};
	});
}

/**
 * Get timezone data from cache or load from JSON files
 */
export async function getTimezoneData(): Promise<{
	cities: City[];
	countries: Country[];
	timezones: Timezone[];
}> {
	await initDB();
	const db = dbInstance.db!;
	const tx = db.transaction([STORES.TIMEZONE_DATA], 'readonly');
	const store = tx.objectStore(STORES.TIMEZONE_DATA);
	
	return new Promise((resolve, reject) => {
		const request = store.get('data');
		
		request.onsuccess = () => {
			const cached = request.result;
			
			// Always load fresh data from JSON files to ensure we have all cities
			// Cache might be outdated or incomplete
			const data = {
				cities: getAllCities(),
				countries: countriesData as Country[],
				timezones: timezonesData as Timezone[]
			};
			
			// Cache the data
			cacheTimezoneData(data);
			resolve(data);
		};
		
		request.onerror = () => {
			// Fallback to JSON files if IndexedDB fails
			resolve({
				cities: getAllCities(),
				countries: countriesData as Country[],
				timezones: timezonesData as Timezone[]
			});
		};
	});
}

/**
 * Cache timezone data in IndexedDB
 */
async function cacheTimezoneData(data: {
	cities: City[];
	countries: Country[];
	timezones: Timezone[];
}): Promise<void> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.TIMEZONE_DATA], 'readwrite');
		const store = tx.objectStore(STORES.TIMEZONE_DATA);
		
		store.put({
			type: 'data',
			data,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Failed to cache timezone data:', error);
	}
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = tx.objectStore(STORES.USER_PREFERENCES);
		
		return new Promise((resolve, reject) => {
			const request = store.get('default');
			
			request.onsuccess = () => {
				resolve(request.result?.preferences || null);
			};
			
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error('Failed to get user preferences:', error);
		return null;
	}
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = tx.objectStore(STORES.USER_PREFERENCES);
		
		// Create a plain object that can be cloned by IndexedDB
		// Ensure all arrays are plain arrays, not Svelte runes
		const plainPreferences: UserPreferences = {
			timeFormat: preferences.timeFormat,
			selectedCities: Array.isArray(preferences.selectedCities) 
				? [...preferences.selectedCities] 
				: [],
			cityOrder: Array.isArray(preferences.cityOrder)
				? [...preferences.cityOrder]
				: preferences.selectedCities ? [...preferences.selectedCities] : [],
			widgetConfigs: Array.isArray(preferences.widgetConfigs)
				? preferences.widgetConfigs.map(config => ({
					id: config.id,
					name: config.name,
					cities: Array.isArray(config.cities) ? [...config.cities] : [],
					displayFormat: config.displayFormat,
					layout: config.layout,
					createdAt: config.createdAt
				}))
				: undefined
		};
		
		store.put({
			id: 'default',
			preferences: plainPreferences,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Failed to save user preferences:', error);
	}
}

/**
 * Get widget configuration
 */
export async function getWidgetConfig(id: string): Promise<WidgetConfig | null> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.WIDGET_CONFIGS], 'readonly');
		const store = tx.objectStore(STORES.WIDGET_CONFIGS);
		
		return new Promise((resolve, reject) => {
			const request = store.get(id);
			
			request.onsuccess = () => {
				resolve(request.result || null);
			};
			
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error('Failed to get widget config:', error);
		return null;
	}
}

/**
 * Save widget configuration
 */
export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.WIDGET_CONFIGS], 'readwrite');
		const store = tx.objectStore(STORES.WIDGET_CONFIGS);
		
		store.put({
			...config,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Failed to save widget config:', error);
	}
}

/**
 * Get meeting converter preferences
 */
export async function getMeetingConverterPreferences(): Promise<MeetingConverterPreferences | null> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = tx.objectStore(STORES.USER_PREFERENCES);
		
		return new Promise((resolve, reject) => {
			const request = store.get('meeting-converter');
			
			request.onsuccess = () => {
				resolve(request.result?.preferences || null);
			};
			
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error('Failed to get meeting converter preferences:', error);
		return null;
	}
}

/**
 * Save meeting converter preferences
 */
export async function saveMeetingConverterPreferences(preferences: MeetingConverterPreferences): Promise<void> {
	try {
		await initDB();
		const db = dbInstance.db!;
		const tx = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = tx.objectStore(STORES.USER_PREFERENCES);
		
		// Create a plain object that can be cloned by IndexedDB
		const plainPreferences: MeetingConverterPreferences = {
			selectedCities: Array.isArray(preferences.selectedCities) 
				? [...preferences.selectedCities] 
				: [],
			cityOrder: Array.isArray(preferences.cityOrder)
				? [...preferences.cityOrder]
				: preferences.selectedCities ? [...preferences.selectedCities] : [],
			lastInputTime: preferences.lastInputTime ? {
				type: preferences.lastInputTime.type,
				time: preferences.lastInputTime.time,
				cityId: preferences.lastInputTime.cityId
			} : undefined
		};
		
		store.put({
			id: 'meeting-converter',
			preferences: plainPreferences,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Failed to save meeting converter preferences:', error);
	}
}
