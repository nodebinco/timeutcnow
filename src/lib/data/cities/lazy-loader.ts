/**
 * Lazy loader for cities data
 * This file provides a way to load cities data without importing all JSON files at build time
 * The actual data will be loaded from IndexedDB at runtime
 */

import type { City } from '$lib/types/timezone';

/**
 * Get all cities - this is now a placeholder that will be replaced
 * by IndexedDB loading in indexed-db-utils.ts
 * 
 * @deprecated Use getTimezoneData() from indexed-db-utils.ts instead
 */
export function getAllCities(): City[] {
	// This function is kept for backward compatibility
	// but should not be used directly anymore
	// Data will be loaded from IndexedDB instead
	console.warn('getAllCities() called directly - consider using getTimezoneData() from indexed-db-utils.ts');
	return [];
}

/**
 * Get cities for a specific country
 * 
 * @deprecated Use getTimezoneData() and filter by country instead
 */
export function getCitiesByCountry(countryCode: string): City[] {
	// This function is kept for backward compatibility
	// but should not be used directly anymore
	console.warn('getCitiesByCountry() called directly - consider using getTimezoneData() and filtering instead');
	return [];
}
