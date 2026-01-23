/**
 * IndexedDB utilities for user preferences
 * Uses the same IndexedDB database as timezone data
 */

import type { UserPreferences, WidgetConfig, MeetingConverterPreferences } from '$lib/types/timezone';
import { initDB, STORES } from './indexed-db-data';

/**
 * Get home selected cities from IndexedDB
 */
export async function getHomeSelectedCities(): Promise<string[]> {
	try {
		console.log('🔍 getHomeSelectedCities: Opening IndexedDB...');
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		const request = store.get('home-selected-cities');

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				if (request.result) {
					const data = request.result;
					const cities = Array.isArray(data.cities) ? data.cities : [];
					console.log(`📋 getHomeSelectedCities: Found ${cities.length} cities:`, cities);
					resolve(cities);
				} else {
					console.log('📋 getHomeSelectedCities: No key found, returning empty array');
					resolve([]);
				}
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getHomeSelectedCities error:', error);
				reject(new Error(`Failed to get home selected cities: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to get home selected cities:', error);
		if (error instanceof Error) {
			console.error('Error details:', error.message, error.stack);
		}
		return [];
	}
}

/**
 * Save home selected cities to IndexedDB
 */
export async function saveHomeSelectedCities(cities: string[]): Promise<void> {
	try {
		console.log('💾 saveHomeSelectedCities: Starting...', {
			citiesCount: cities.length,
			cities: cities
		});
		
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		
		const data = {
			id: 'home-selected-cities',
			cities: cities,
			timestamp: Date.now()
		};
		
		console.log('💾 saveHomeSelectedCities: Saving data:', data);
		const request = store.put(data);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				console.log('✅ saveHomeSelectedCities: Successfully saved to IndexedDB with key: home-selected-cities');
				
				// Verify the save
				const verifyRequest = store.get('home-selected-cities');
				verifyRequest.onsuccess = () => {
					if (verifyRequest.result) {
						console.log('✅ saveHomeSelectedCities: Verified - data exists in IndexedDB', verifyRequest.result);
					} else {
						console.warn('⚠️ saveHomeSelectedCities: Warning - data not found after save');
					}
					resolve();
				};
				verifyRequest.onerror = () => {
					console.warn('⚠️ saveHomeSelectedCities: Could not verify save');
					resolve(); // Still resolve, save might have succeeded
				};
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ saveHomeSelectedCities: Failed to save:', error);
				reject(new Error(`Failed to save home selected cities: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to save home selected cities:', error);
		if (error instanceof Error) {
			console.error('Error details:', error.message, error.stack);
		}
		throw error;
	}
}

/**
 * Get user preferences from IndexedDB
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		const request = store.get('default');

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				if (request.result) {
					const result = request.result as { preferences?: UserPreferences; [key: string]: any };
					const prefs = result.preferences as UserPreferences;
					if (prefs) {
						console.log('📋 getUserPreferences: Found preferences');
						resolve(prefs);
					} else {
						console.log('📋 getUserPreferences: No preferences found');
						resolve(null);
					}
				} else {
					console.log('📋 getUserPreferences: No preferences found');
					resolve(null);
				}
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getUserPreferences error:', error);
				reject(new Error(`Failed to get user preferences: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to get user preferences:', error);
		return null;
	}
}

/**
 * Save user preferences to IndexedDB
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
	try {
		console.log('💾 saveUserPreferences: Saving to IndexedDB...', {
			timeFormat: preferences.timeFormat,
			selectedCities: preferences.selectedCities?.length || 0,
			cityOrder: preferences.cityOrder?.length || 0
		});
		
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		
		const data = {
			id: 'default',
			preferences: preferences,
			timestamp: Date.now()
		};
		
		const request = store.put(data);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				console.log('✅ saveUserPreferences: Successfully saved to IndexedDB');
				resolve();
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ saveUserPreferences: Failed to save:', error);
				reject(new Error(`Failed to save user preferences: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to save user preferences:', error);
		throw error;
	}
}

/**
 * Get widget configuration from IndexedDB
 */
export async function getWidgetConfig(id: string): Promise<WidgetConfig | null> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		const request = store.get(`widget-${id}`);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				if (request.result) {
					const config = request.result.config as WidgetConfig;
					resolve(config);
				} else {
					resolve(null);
				}
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getWidgetConfig error:', error);
				reject(new Error(`Failed to get widget config: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to get widget config:', error);
		return null;
	}
}

/**
 * Save widget configuration to IndexedDB
 */
export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		
		if (!config.id) {
			throw new Error('Widget config must have an id');
		}
		
		const data = {
			id: `widget-${config.id}`,
			config: config,
			timestamp: Date.now()
		};
		
		const request = store.put(data);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				resolve();
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ saveWidgetConfig: Failed to save:', error);
				reject(new Error(`Failed to save widget config: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to save widget config:', error);
		throw error;
	}
}

/**
 * Get meeting converter preferences from IndexedDB
 */
export async function getMeetingConverterPreferences(): Promise<MeetingConverterPreferences | null> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		const request = store.get('meeting-converter');

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				if (request.result) {
					const prefs = request.result.preferences as MeetingConverterPreferences;
					resolve(prefs);
				} else {
					resolve(null);
				}
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getMeetingConverterPreferences error:', error);
				reject(new Error(`Failed to get meeting converter preferences: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to get meeting converter preferences:', error);
		return null;
	}
}

/**
 * Save meeting converter preferences to IndexedDB
 */
export async function saveMeetingConverterPreferences(preferences: MeetingConverterPreferences): Promise<void> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		
		const data = {
			id: 'meeting-converter',
			preferences: preferences,
			timestamp: Date.now()
		};
		
		const request = store.put(data);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				resolve();
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ saveMeetingConverterPreferences: Failed to save:', error);
				reject(new Error(`Failed to save meeting converter preferences: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to save meeting converter preferences:', error);
		throw error;
	}
}

/**
 * Get saved locale from IndexedDB
 */
export async function getSavedLocale(): Promise<string | null> {
	try {
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		const request = store.get('locale');

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				if (request.result && request.result.locale) {
					console.log('📋 getSavedLocale: Found locale:', request.result.locale);
					resolve(request.result.locale);
				} else {
					console.log('📋 getSavedLocale: No locale found');
					resolve(null);
				}
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ getSavedLocale error:', error);
				reject(new Error(`Failed to get saved locale: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to get saved locale:', error);
		return null;
	}
}

/**
 * Save locale to IndexedDB
 */
export async function saveLocale(locale: string): Promise<void> {
	try {
		console.log('💾 saveLocale: Saving locale to IndexedDB...', locale);
		
		const db = await initDB();
		const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
		const store = transaction.objectStore(STORES.USER_PREFERENCES);
		
		const data = {
			id: 'locale',
			locale: locale,
			timestamp: Date.now()
		};
		
		const request = store.put(data);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				console.log('✅ saveLocale: Successfully saved locale to IndexedDB');
				resolve();
			};
			request.onerror = (event: Event) => {
				const error = (event.target as IDBRequest).error;
				console.error('❌ saveLocale: Failed to save:', error);
				reject(new Error(`Failed to save locale: ${error?.message || 'Unknown error'}`));
			};
		});
	} catch (error) {
		console.error('❌ Failed to save locale:', error);
		throw error;
	}
}
