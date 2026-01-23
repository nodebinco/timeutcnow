import type { City } from '$lib/types/timezone';

/**
 * Get current time for a specific timezone
 * Converts a UTC Date to a Date object representing the local time in the timezone
 */
export function getCityTime(date: Date, timezone: string): Date {
	// Use Intl.DateTimeFormat to get the time components in the target timezone
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
	
	const parts = formatter.formatToParts(date);
	const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
	const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
	const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
	const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
	const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
	const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
	
	// Create a Date object with these components (in local timezone)
	// This represents the local time in the target timezone
	return new Date(year, month, day, hour, minute, second);
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
	// Extract time components (representing local time in the target timezone)
	const year = localDate.getFullYear();
	const month = localDate.getMonth();
	const day = localDate.getDate();
	const hours = localDate.getHours();
	const minutes = localDate.getMinutes();
	const seconds = localDate.getSeconds();
	
	console.log(`[convertCityTimeToUTC] Input: ${year}-${month+1}-${day} ${hours}:${minutes}:${seconds} in ${timezone}`);
	
	// Simple logic: Find UTC time that when displayed in timezone gives us our target time
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
	
	// Start with UTC estimate (same components)
	let utc = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
	console.log(`[convertCityTimeToUTC] Initial UTC estimate: ${utc.toISOString()}`);
	
	// Iterate to find correct UTC
	for (let i = 0; i < 15; i++) {
		const parts = formatter.formatToParts(utc);
		const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
		const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
		const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
		const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
		const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
		const tzSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0');
		
		console.log(`[convertCityTimeToUTC] Iteration ${i}: UTC ${utc.toISOString()} shows as ${tzYear}-${tzMonth+1}-${tzDay} ${tzHour}:${tzMinute}:${tzSecond} in ${timezone}`);
		
		// Check if match
		if (tzYear === year && tzMonth === month && tzDay === day && 
		    tzHour === hours && tzMinute === minutes && tzSecond === seconds) {
			console.log(`[convertCityTimeToUTC] Match found! Returning UTC: ${utc.toISOString()}`);
			return utc;
		}
		
		// Calculate difference: how much to adjust UTC
		// Simple logic: if timezone shows 13:00 but we want 06:00, UTC must go back 7 hours
		
		// Calculate time difference in seconds
		const targetSeconds = hours * 3600 + minutes * 60 + seconds;
		const currentSeconds = tzHour * 3600 + tzMinute * 60 + tzSecond;
		let timeDiffSeconds = currentSeconds - targetSeconds;
		
		// Handle date crossing: if dates are different, adjust time difference
		if (tzYear !== year || tzMonth !== month || tzDay !== day) {
			// Calculate how many days difference
			// If timezone shows next day but we want current day, subtract 24 hours
			// If timezone shows previous day but we want current day, add 24 hours
			const targetDate = new Date(Date.UTC(year, month, day));
			const currentDate = new Date(Date.UTC(tzYear, tzMonth, tzDay));
			const dayDiffMs = currentDate.getTime() - targetDate.getTime();
			const dayDiff = Math.round(dayDiffMs / (1000 * 60 * 60 * 24));
			timeDiffSeconds += dayDiff * 86400;
		}
		
		console.log(`[convertCityTimeToUTC] Time diff: ${timeDiffSeconds}s (${Math.round(timeDiffSeconds/3600)}h)`);
		
		// Adjust UTC: subtract the difference (if timezone is ahead, UTC goes back)
		const adjustMs = timeDiffSeconds * 1000;
		utc = new Date(utc.getTime() - adjustMs);
		
		console.log(`[convertCityTimeToUTC] Adjusted UTC: ${utc.toISOString()}`);
		
		if (Math.abs(adjustMs) < 1000) {
			console.log(`[convertCityTimeToUTC] Adjustment too small, breaking`);
			break;
		}
	}
	
	console.log(`[convertCityTimeToUTC] Final UTC: ${utc.toISOString()}`);
	return utc;
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
