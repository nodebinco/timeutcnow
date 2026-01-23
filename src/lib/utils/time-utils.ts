import type { TimeFormat } from '$lib/types/timezone';

/**
 * Format time in 12-hour format with AM/PM
 */
export function format12Hour(date: Date): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Format time in 24-hour format
 */
export function format24Hour(date: Date): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format time based on format preference
 */
export function formatTime(date: Date, format: TimeFormat, timezone?: string): string {
	const targetDate = timezone ? new Date(date.toLocaleString('en-US', { timeZone: timezone })) : date;
	
	if (format === '12h') {
		return format12Hour(targetDate);
	}
	return format24Hour(targetDate);
}

/**
 * Format time without seconds (for city cards)
 * Note: date should already be converted to the target timezone using getCityTime
 */
export function formatTimeShort(date: Date, format: TimeFormat, timezone?: string): string {
	// date is already in the target timezone, so use getHours/getMinutes directly
	const hours = date.getHours();
	const minutes = date.getMinutes();
	
	if (format === '12h') {
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
	}
	
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get Unix timestamp (seconds since Jan 1, 1970)
 */
export function getUnixTimestamp(date: Date = new Date()): number {
	return Math.floor(date.getTime() / 1000);
}

/**
 * Calculate Julian date
 */
export function getJulianDate(date: Date = new Date()): number {
	return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Get UTC offset in hours
 */
export function getUTCOffset(date: Date = new Date()): number {
	return -date.getTimezoneOffset() / 60;
}

/**
 * Format UTC offset string (e.g., "+5", "-3")
 */
export function formatUTCOffset(offset: number): string {
	return offset >= 0 ? `+${offset}` : offset.toString();
}

/**
 * Get ISO 8601 string
 */
export function getISO8601(date: Date = new Date()): string {
	return date.toISOString();
}

/**
 * Get UTC string
 */
export function getUTCString(date: Date = new Date()): string {
	return date.toUTCString();
}
