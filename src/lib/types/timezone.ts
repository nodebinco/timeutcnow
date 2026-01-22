export interface City {
	id: string;
	name: string;
	country: string;
	timezone: string;
	label: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

export interface Country {
	code: string;
	name: string;
	primaryTimezone: string;
}

export interface Timezone {
	iana: string;
	abbreviation: string;
	utcOffset: number;
	dstOffset?: number;
	dstStart?: string;
	dstEnd?: string;
}

export interface TimezoneData {
	cities: City[];
	countries: Country[];
	timezones: Timezone[];
}

export type TimeFormat = '12h' | '24h';

export interface UserPreferences {
	timeFormat: TimeFormat;
	selectedCities: string[]; // Array of city IDs
	cityOrder?: string[]; // Ordered array of city IDs
	widgetConfigs?: WidgetConfig[];
}

export interface WidgetConfig {
	id: string;
	name?: string;
	cities: string[]; // Array of city IDs
	displayFormat: 'digital' | 'analog';
	layout: 'grid' | 'list';
	createdAt: number;
}

export interface MeetingConverterPreferences {
	selectedCities: string[]; // Array of city IDs
	cityOrder?: string[]; // Optional ordering
	lastInputTime?: {
		type: 'utc' | 'city';
		time: string; // ISO 8601 string
		cityId?: string; // If type is 'city'
	};
}
