/**
 * Locale storage utilities
 * Syncs locale between IndexedDB and paraglide
 */

import { getSavedLocale, saveLocale } from './indexed-db-preferences';
import { defineCustomClientStrategy } from '$lib/paraglide/runtime';

/**
 * Initialize custom locale strategy that loads from IndexedDB
 */
export function initLocaleStorage() {
	// Define custom strategy that loads from IndexedDB
	defineCustomClientStrategy('custom-indexeddb', {
		getLocale: async () => {
			try {
				const savedLocale = await getSavedLocale();
				if (savedLocale) {
					console.log('🌐 Custom strategy: Found locale in IndexedDB:', savedLocale);
					return savedLocale;
				}
				return undefined;
			} catch (error) {
				console.error('Failed to get locale from IndexedDB:', error);
				return undefined;
			}
		},
		setLocale: async (locale: string) => {
			try {
				await saveLocale(locale);
				console.log('🌐 Custom strategy: Saved locale to IndexedDB:', locale);
			} catch (error) {
				console.error('Failed to save locale to IndexedDB:', error);
			}
		}
	});
}
