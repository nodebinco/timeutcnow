import type { City, Country, Timezone, UserPreferences, WidgetConfig, MeetingConverterPreferences } from '$lib/types/timezone';
import {
	loadDataFromCSVIfNeeded,
	getAllCities,
	getAllCountries,
	getAllTimezones,
	getCitiesByIds as getCitiesByIdsFromIndexedDB,
	searchCities as searchCitiesInIndexedDB
} from './indexed-db-data';
import {
	getHomeSelectedCities as getHomeSelectedCitiesFromIndexedDB,
	saveHomeSelectedCities as saveHomeSelectedCitiesToIndexedDB,
	getUserPreferences as getUserPreferencesFromIndexedDB,
	saveUserPreferences as saveUserPreferencesToIndexedDB,
	getWidgetConfig as getWidgetConfigFromIndexedDB,
	saveWidgetConfig as saveWidgetConfigToIndexedDB,
	getMeetingConverterPreferences as getMeetingConverterPreferencesFromIndexedDB,
	saveMeetingConverterPreferences as saveMeetingConverterPreferencesToIndexedDB
} from './indexed-db-preferences';

/**
 * Get timezone data from IndexedDB
 * Loads from CSV on first visit if needed
 */
export async function getTimezoneData(): Promise<{
	cities: City[];
	countries: Country[];
	timezones: Timezone[];
}> {
	try {
		console.log('🔍 getTimezoneData: Checking if data needs to be loaded...');
		
		// Load data from CSV if IndexedDB is empty
		await loadDataFromCSVIfNeeded();
		
		// Get data from IndexedDB
		const [cities, countries, timezones] = await Promise.all([
			getAllCities(),
			getAllCountries(),
			getAllTimezones()
		]);
		
		console.log(`📊 getTimezoneData: Loaded ${cities.length} cities, ${countries.length} countries, ${timezones.length} timezones`);
		
		return {
			cities,
			countries,
			timezones
		};
	} catch (error) {
		console.error('❌ getTimezoneData: Failed to load data:', error);
		return {
			cities: [],
			countries: [],
			timezones: []
		};
	}
}

/**
 * Search cities - uses IndexedDB
 */
export async function searchCitiesInDB(query: string, countryNames?: Map<string, string>): Promise<City[]> {
	return searchCitiesInIndexedDB(query, countryNames);
}

/**
 * Get cities by IDs - uses IndexedDB
 */
export function getCitiesByIds(ids: string[]): Promise<City[]> {
	return getCitiesByIdsFromIndexedDB(ids);
}

/**
 * Get home selected cities from IndexedDB
 */
export async function getHomeSelectedCities(): Promise<string[]> {
	return getHomeSelectedCitiesFromIndexedDB();
}

/**
 * Save home selected cities to IndexedDB
 */
export async function saveHomeSelectedCities(cities: string[]): Promise<void> {
	return saveHomeSelectedCitiesToIndexedDB(cities);
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
	return getUserPreferencesFromIndexedDB();
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
	return saveUserPreferencesToIndexedDB(preferences);
}

/**
 * Get widget configuration
 */
export async function getWidgetConfig(id: string): Promise<WidgetConfig | null> {
	return getWidgetConfigFromIndexedDB(id);
}

/**
 * Save widget configuration
 */
export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
	return saveWidgetConfigToIndexedDB(config);
}

/**
 * Get meeting converter preferences
 */
export async function getMeetingConverterPreferences(): Promise<MeetingConverterPreferences | null> {
	return getMeetingConverterPreferencesFromIndexedDB();
}

/**
 * Save meeting converter preferences
 */
export async function saveMeetingConverterPreferences(preferences: MeetingConverterPreferences): Promise<void> {
	return saveMeetingConverterPreferencesToIndexedDB(preferences);
}

/**
 * Get saved locale from IndexedDB
 */
export async function getSavedLocale(): Promise<string | null> {
	try {
		const { getSavedLocale: getSavedLocaleFromIndexedDB } = await import('./indexed-db-preferences');
		return getSavedLocaleFromIndexedDB();
	} catch (error) {
		console.error('Failed to get saved locale:', error);
		return null;
	}
}

/**
 * Save locale to IndexedDB
 */
export async function saveLocale(locale: string): Promise<void> {
	try {
		const { saveLocale: saveLocaleToIndexedDB } = await import('./indexed-db-preferences');
		return saveLocaleToIndexedDB(locale);
	} catch (error) {
		console.error('Failed to save locale:', error);
		throw error;
	}
}
