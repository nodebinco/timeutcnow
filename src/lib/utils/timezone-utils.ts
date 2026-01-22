import type { City } from '$lib/types/timezone';

/**
 * Get current time for a specific timezone
 */
export function getCityTime(date: Date, timezone: string): Date {
	return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Get UTC offset for a timezone in hours
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
	const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
	const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
	const offsetMs = tzDate.getTime() - utcDate.getTime();
	return Math.round(offsetMs / (1000 * 60 * 60));
}

/**
 * Format UTC offset string (e.g., "UTC+5", "UTC-3", "GMT+8")
 */
export function formatTimezoneOffset(offset: number, useGMT: boolean = false): string {
	const prefix = useGMT ? 'GMT' : 'UTC';
	const sign = offset >= 0 ? '+' : '';
	return `${prefix}${sign}${offset}`;
}

/**
 * Check if it's day time (6 AM to 6 PM) in a timezone
 */
export function isDayTime(date: Date, timezone: string): boolean {
	const cityTime = getCityTime(date, timezone);
	const hours = cityTime.getHours();
	return hours >= 6 && hours < 18;
}

/**
 * Search cities by name, country, timezone label, or timezone IANA
 */
export function searchCities(cities: City[], query: string, countryNames?: Map<string, string>): City[] {
	if (!query || !query.trim()) {
		return cities;
	}
	
	const lowerQuery = query.toLowerCase().trim();
	if (!lowerQuery) {
		return cities;
	}
	
	return cities.filter(city => {
		const cityNameMatch = city.name?.toLowerCase().includes(lowerQuery) || false;
		const labelMatch = city.label?.toLowerCase().includes(lowerQuery) || false;
		const timezoneMatch = city.timezone?.toLowerCase().includes(lowerQuery) || false;
		const countryMatch = countryNames 
			? countryNames.get(city.country)?.toLowerCase().includes(lowerQuery) || false
			: city.country?.toLowerCase().includes(lowerQuery) || false;
		
		return cityNameMatch || labelMatch || timezoneMatch || countryMatch;
	});
}

/**
 * Filter cities by selected IDs
 */
export function filterCitiesByIds(cities: City[], selectedIds: string[]): City[] {
	if (selectedIds.length === 0) {
		return cities;
	}
	return cities.filter(city => selectedIds.includes(city.id));
}

/**
 * Sort cities by selected order
 */
export function sortCitiesByOrder(cities: City[], order: string[]): City[] {
	const cityMap = new Map(cities.map(city => [city.id, city]));
	const ordered: City[] = [];
	const unordered: City[] = [];
	
	// Add cities in specified order
	for (const id of order) {
		const city = cityMap.get(id);
		if (city) {
			ordered.push(city);
			cityMap.delete(id);
		}
	}
	
	// Add remaining cities
	for (const city of cityMap.values()) {
		unordered.push(city);
	}
	
	return [...ordered, ...unordered];
}

/**
 * Convert a time from a specific city to UTC
 * @param localDate The date/time in the city's timezone (components represent local time)
 * @param timezone The IANA timezone string
 * @returns UTC Date object
 */
export function convertCityTimeToUTC(localDate: Date, timezone: string): Date {
	// Extract local date components (these represent the local time in the timezone)
	const year = localDate.getFullYear();
	const month = localDate.getMonth();
	const day = localDate.getDate();
	const hours = localDate.getHours();
	const minutes = localDate.getMinutes();
	const seconds = localDate.getSeconds();
	const milliseconds = localDate.getMilliseconds();
	
	// Strategy: Find the UTC time that, when displayed in the timezone, equals our target
	// We'll use an iterative approach to find the correct UTC time
	
	// Start with an estimate: assume the local time components represent UTC
	let testUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
	
	// Use Intl to see what this UTC time looks like in the target timezone
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
	
	// Iteratively adjust to find the correct UTC time (max 10 iterations)
	for (let i = 0; i < 10; i++) {
		const parts = formatter.formatToParts(testUTC);
		const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
		const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
		const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
		const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
		const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
		const tzSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0');
		
		// Check if we've found the match
		if (tzYear === year && tzMonth === month && tzDay === day && 
		    tzHour === hours && tzMinute === minutes && tzSecond === seconds) {
			return testUTC;
		}
		
		// Calculate the difference in time components
		// Create date objects for comparison (using local timezone for both)
		const targetDate = new Date(year, month, day, hours, minutes, seconds, milliseconds);
		const currentDate = new Date(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond, 0);
		const diffMs = targetDate.getTime() - currentDate.getTime();
		
		// Adjust the UTC time by the difference
		testUTC = new Date(testUTC.getTime() - diffMs);
		
		// Prevent infinite loops
		if (Math.abs(diffMs) < 1000) {
			break;
		}
	}
	
	return testUTC;
}

/**
 * Convert UTC time to a specific city's local time
 * @param utcDate The UTC date/time
 * @param timezone The IANA timezone string
 * @returns Date object representing the local time in the city
 */
export function convertUTCToCity(utcDate: Date, timezone: string): Date {
	return getCityTime(utcDate, timezone);
}

/**
 * Convert a time from one timezone to another
 * @param date The source date/time
 * @param fromTimezone Source IANA timezone (or 'UTC')
 * @param toTimezone Target IANA timezone (or 'UTC')
 * @returns Date object in the target timezone
 */
export function convertTimeToCity(date: Date, fromTimezone: string, toTimezone: string): Date {
	if (fromTimezone === 'UTC' || fromTimezone === 'Etc/UTC') {
		return convertUTCToCity(date, toTimezone);
	}
	
	if (toTimezone === 'UTC' || toTimezone === 'Etc/UTC') {
		return convertCityTimeToUTC(date, fromTimezone);
	}
	
	// Convert from source timezone to UTC first, then to target timezone
	const utc = convertCityTimeToUTC(date, fromTimezone);
	return convertUTCToCity(utc, toTimezone);
}
