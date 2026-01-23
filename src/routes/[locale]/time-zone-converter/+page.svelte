<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Clock, Copy, Check, Search, Sunrise, Moon, Plus, X, Menu } from 'lucide-svelte';
	import TimeInput from '$lib/components/time-input.svelte';
	import ConverterCityCard from '$lib/components/converter-city-card.svelte';
	import AddCityCard from '$lib/components/add-city-card.svelte';
	import SearchInput from '$lib/components/search-input.svelte';
	import TimeFormatSelector from '$lib/components/time-format-selector.svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { getTimezoneData, getMeetingConverterPreferences, saveMeetingConverterPreferences, getUserPreferences, saveUserPreferences } from '$lib/utils/indexed-db-utils';
	import { formatTime } from '$lib/utils/time-utils';
	import { searchCities, filterCitiesByIds, sortCitiesByOrder, isDayTime, convertCityTimeToUTC, convertUTCToCity, getTimezoneOffset, formatTimezoneOffset } from '$lib/utils/timezone-utils';
	import * as m from '$lib/paraglide/messages';

	type InputMode = 'utc' | 'city';

	let timeFormat = $state<TimeFormat>('24h');
	let inputMode = $state<InputMode>('city');
	let mobileMenuOpen = $state(false);
	// Initialize with current date/time immediately
	const now = new Date();
	let inputDate = $state(now.toISOString().split('T')[0]);
	let selectedCityId = $state<string>('local');
	
	// Initialize userTimezone immediately
	let userTimezone = $state(Intl.DateTimeFormat().resolvedOptions().timeZone);
	
	// Calculate initial time based on mode - set immediately
	const getInitialTime = () => {
		const currentNow = new Date();
		if (inputMode === 'city' && selectedCityId === 'local' && userTimezone) {
			// Get local time in user's timezone
			const localDate = new Date(currentNow.toLocaleString('en-US', { timeZone: userTimezone }));
			return `${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}:${String(localDate.getSeconds()).padStart(2, '0')}`;
		} else {
			// Use UTC time as fallback
			return `${String(currentNow.getUTCHours()).padStart(2, '0')}:${String(currentNow.getUTCMinutes()).padStart(2, '0')}:${String(currentNow.getUTCSeconds()).padStart(2, '0')}`;
		}
	};
	
	let inputTime = $state(getInitialTime());
	let allCities = $state<City[]>([]);
	let selectedCityIds = $state<string[]>([]);
	let copied = $state(false);
	let addMoreSearchQuery = $state('');
	let countryNames = $state<Map<string, string>>(new Map());
	let targetTime = $state<Date | null>(null);
	let showAllTimezones = $state(false);
	let citySearchQuery = $state('');
	let currentTime = $state(new Date());
	const DEFAULT_TIMEZONE_LIMIT = 24;
	const DEFAULT_SUGGESTED_CITIES = ['london', 'new-york', 'tokyo', 'dubai'];

	// Update current time every second
	$effect(() => {
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		return () => clearInterval(timer);
	});

	// Update target time when input changes
	$effect(() => {
		// Track all dependencies: inputMode, inputDate, inputTime, selectedCityId, userTimezone, allCities
		if (inputMode === 'utc') {
			if (inputDate && inputTime) {
				// inputTime can be HH:mm or HH:mm:ss
				const timeParts = inputTime.split(':');
				const hours = timeParts[0];
				const minutes = timeParts[1];
				const seconds = timeParts[2] || '00';
				const dateTimeStr = `${inputDate}T${hours}:${minutes}:${seconds}Z`;
				const date = new Date(dateTimeStr);
				if (!isNaN(date.getTime())) {
					targetTime = date;
				} else {
					targetTime = null;
				}
			} else {
				targetTime = null;
			}
		} else if (inputMode === 'city') {
			if (inputDate && inputTime && selectedCityId) {
				// If selectedCityId is 'local', use user's timezone
				let timezoneToUse = '';
				if (selectedCityId === 'local') {
					// Use userTimezone if available, otherwise try to get it
					if (userTimezone) {
						timezoneToUse = userTimezone;
					} else {
						// Fallback: get timezone from browser
						try {
							timezoneToUse = Intl.DateTimeFormat().resolvedOptions().timeZone;
							userTimezone = timezoneToUse;
						} catch (e) {
							timezoneToUse = '';
						}
					}
				} else if (selectedCityId) {
					// Wait for allCities to be loaded before trying to find city
					if (allCities.length > 0) {
						const city = allCities.find(c => c.id === selectedCityId);
						if (city) {
							timezoneToUse = city.timezone;
						}
					} else {
						// allCities not loaded yet, can't calculate
						targetTime = null;
						return;
					}
				}
				
				if (timezoneToUse) {
					// Create a Date object representing the local time in the timezone
					// inputDate is YYYY-MM-DD, inputTime is HH:mm or HH:mm:ss
					const [year, month, day] = inputDate.split('-').map(Number);
					const timeParts = inputTime.split(':');
					const hours = Number(timeParts[0]);
					const minutes = Number(timeParts[1]);
					const seconds = timeParts[2] ? Number(timeParts[2]) : 0;
					
					console.log(`[TimeZoneConverter] Converting: ${year}-${month}-${day} ${hours}:${minutes}:${seconds} in ${timezoneToUse}`);
					
					// Create a date object with local components (representing city time)
					const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
					console.log(`[TimeZoneConverter] Created localDate: ${localDate.toString()}`);
					
					const utcTime = convertCityTimeToUTC(localDate, timezoneToUse);
					console.log(`[TimeZoneConverter] Converted to UTC: ${utcTime ? utcTime.toISOString() : 'null'}`);
					
					if (utcTime && !isNaN(utcTime.getTime())) {
						targetTime = utcTime;
					} else {
						targetTime = null;
					}
				} else {
					targetTime = null;
				}
			} else {
				targetTime = null;
			}
		}
	});

	onMount(async () => {
		try {
			const data = await getTimezoneData();
			allCities = data.cities;
			
			const countryMap = new Map<string, string>();
			data.countries.forEach(country => {
				countryMap.set(country.code, country.name);
			});
			countryNames = countryMap;

			// Ensure user's timezone is set (already set in state initialization, but update if needed)
			if (!userTimezone) {
				userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			}

			// Always use current date and time (never load old date/time from preferences)
			let currentNow = new Date();
			inputDate = currentNow.toISOString().split('T')[0];
			
			// Always set current time based on mode and selected city
			if (inputMode === 'city' && selectedCityId === 'local' && userTimezone) {
				// Get local time in user's timezone
				const localDate = new Date(currentNow.toLocaleString('en-US', { timeZone: userTimezone }));
				inputTime = `${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}:${String(localDate.getSeconds()).padStart(2, '0')}`;
			} else if (inputMode === 'city' && selectedCityId && selectedCityId !== 'local' && allCities.length > 0) {
				// Get time for selected city
				const city = allCities.find(c => c.id === selectedCityId);
				if (city) {
					const cityDate = new Date(currentNow.toLocaleString('en-US', { timeZone: city.timezone }));
					inputTime = `${String(cityDate.getHours()).padStart(2, '0')}:${String(cityDate.getMinutes()).padStart(2, '0')}:${String(cityDate.getSeconds()).padStart(2, '0')}`;
				} else {
					// Fallback to UTC
					inputTime = `${String(currentNow.getUTCHours()).padStart(2, '0')}:${String(currentNow.getUTCMinutes()).padStart(2, '0')}:${String(currentNow.getUTCSeconds()).padStart(2, '0')}`;
				}
			} else {
				// Use UTC time for UTC mode
				inputTime = `${String(currentNow.getUTCHours()).padStart(2, '0')}:${String(currentNow.getUTCMinutes()).padStart(2, '0')}:${String(currentNow.getUTCSeconds()).padStart(2, '0')}`;
			}

			try {
				const prefs = await getUserPreferences();
				if (prefs && prefs.timeFormat) {
					timeFormat = prefs.timeFormat;
				}
			} catch (error) {
				console.error('❌ Failed to load user preferences:', error);
			}

			try {
				const meetingPrefs = await getMeetingConverterPreferences();
				if (meetingPrefs) {
					selectedCityIds = [...(meetingPrefs.selectedCities || [])];
					// Load saved preferences (mode and city selection) but always use current date/time
					if (meetingPrefs.lastInputTime) {
						inputMode = meetingPrefs.lastInputTime.type;
						if (meetingPrefs.lastInputTime.type === 'city') {
							selectedCityId = meetingPrefs.lastInputTime.cityId || 'local';
						} else {
							selectedCityId = '';
						}
						// Don't load time - always use current time
					}
					// Ensure selectedCityId is set for city mode
					if (inputMode === 'city' && (!selectedCityId || selectedCityId === '')) {
						selectedCityId = 'local';
					}
				}
			} catch (error) {
				console.error('❌ Failed to load meeting converter preferences:', error);
			}
			
			// Always use current date and time after loading preferences
			// Update date and time based on current mode and selected city
			currentNow = new Date();
			inputDate = currentNow.toISOString().split('T')[0];
			
			// Always set current time based on mode
			if (inputMode === 'city' && selectedCityId === 'local' && userTimezone) {
				// Get local time in user's timezone
				const localDate = new Date(currentNow.toLocaleString('en-US', { timeZone: userTimezone }));
				inputTime = `${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}:${String(localDate.getSeconds()).padStart(2, '0')}`;
			} else if (inputMode === 'city' && selectedCityId && selectedCityId !== 'local' && allCities.length > 0) {
				// Get time for selected city
				const city = allCities.find(c => c.id === selectedCityId);
				if (city) {
					const cityDate = new Date(currentNow.toLocaleString('en-US', { timeZone: city.timezone }));
					inputTime = `${String(cityDate.getHours()).padStart(2, '0')}:${String(cityDate.getMinutes()).padStart(2, '0')}:${String(cityDate.getSeconds()).padStart(2, '0')}`;
				} else {
					// Fallback to UTC
					inputTime = `${String(currentNow.getUTCHours()).padStart(2, '0')}:${String(currentNow.getUTCMinutes()).padStart(2, '0')}:${String(currentNow.getUTCSeconds()).padStart(2, '0')}`;
				}
			} else {
				// Use UTC time
				inputTime = `${String(currentNow.getUTCHours()).padStart(2, '0')}:${String(currentNow.getUTCMinutes()).padStart(2, '0')}:${String(currentNow.getUTCSeconds()).padStart(2, '0')}`;
			}

			if (selectedCityIds.length === 0) {
				selectedCityIds = ['london', 'new-york', 'tokyo', 'dubai', 'sydney', 'paris', 'singapore', 'hong-kong'];
			}
		} catch (error) {
			console.error('❌ Failed to load data:', error);
		}
	});

	let filteredCities = $derived.by(() => {
		if (selectedCityIds.length === 0) {
			return [];
		}
		let filtered = filterCitiesByIds(allCities, selectedCityIds);
		filtered = sortCitiesByOrder(filtered, selectedCityIds);
		return filtered;
	});

	let cities = $derived.by(() => {
		// Always show cities if they are selected, even if targetTime is not set yet
		// This prevents cities from disappearing when switching input modes
		return filteredCities;
	});

	async function handleCopy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	async function handleTimeFormatChange(format: TimeFormat) {
		timeFormat = format;
		const prefs = await getUserPreferences();
		await saveUserPreferences({
			timeFormat: format,
			selectedCities: prefs?.selectedCities || [],
			cityOrder: prefs?.cityOrder,
			widgetConfigs: prefs?.widgetConfigs
		});
	}

	async function addCity(cityId: string) {
		if (!selectedCityIds.includes(cityId)) {
			selectedCityIds = [...selectedCityIds, cityId];
			await saveMeetingConverterPreferences({
				selectedCities: Array.from(selectedCityIds),
				cityOrder: Array.from(selectedCityIds)
			});
		}
	}

	async function removeCity(cityId: string) {
		try {
			if (selectedCityIds.includes(cityId)) {
				selectedCityIds = selectedCityIds.filter(id => id !== cityId);
				await saveMeetingConverterPreferences({
					selectedCities: Array.from(selectedCityIds),
					cityOrder: Array.from(selectedCityIds)
				});
			}
		} catch (error) {
			console.error('❌ Failed to remove city:', error);
		}
	}

	async function handleInputChange() {
		const prefs = await getMeetingConverterPreferences();
		await saveMeetingConverterPreferences({
			selectedCities: prefs?.selectedCities || Array.from(selectedCityIds),
			cityOrder: prefs?.cityOrder || Array.from(selectedCityIds),
			lastInputTime: {
				type: inputMode,
				time: targetTime ? targetTime.toISOString() : '',
				// Save selectedCityId, use 'local' as string for local timezone
				cityId: inputMode === 'city' ? (selectedCityId === 'local' ? 'local' : selectedCityId) : undefined
			}
		});
	}

	$effect(() => {
		handleInputChange();
	});

	let citySearchResults = $derived.by(() => {
		if (!citySearchQuery.trim()) {
			return [];
		}
		return searchCities(allCities, citySearchQuery, countryNames).slice(0, 10);
	});

	// Get selected city info and its current time
	const selectedCityInfo = $derived.by(() => {
		if (inputMode !== 'city' || !selectedCityId) {
			return null;
		}
		
		if (selectedCityId === 'local') {
			const offset = getTimezoneOffset(userTimezone, currentTime);
			const offsetStr = formatTimezoneOffset(offset);
			return {
				name: 'My Local Time',
				timezone: userTimezone,
				label: `${offsetStr} (${userTimezone})`,
				country: ''
			};
		} else {
			const city = allCities.find(c => c.id === selectedCityId);
			if (city) {
				const offset = getTimezoneOffset(city.timezone, currentTime);
				const offsetStr = formatTimezoneOffset(offset);
				return {
					name: city.name,
					timezone: city.timezone,
					label: `${offsetStr} (${city.timezone})`,
					country: countryNames.get(city.country) || city.country
				};
			}
		}
		return null;
	});

	// Get selected city's local time based on input
	const selectedCityLocalTime = $derived.by(() => {
		if (!selectedCityInfo || !inputDate || !inputTime) {
			return null;
		}
		
		// The inputDate and inputTime represent the local time in the selected city
		// So we can display them directly
		const [year, month, day] = inputDate.split('-').map(Number);
		const timeParts = inputTime.split(':');
		const hours = Number(timeParts[0]);
		const minutes = Number(timeParts[1]);
		const seconds = timeParts[2] ? Number(timeParts[2]) : 0;
		
		return {
			date: new Date(year, month - 1, day),
			time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
		};
	});

	// Get selected city's current time (live updating)
	const selectedCityCurrentTime = $derived.by(() => {
		if (!selectedCityInfo) {
			return null;
		}
		
		const timezone = selectedCityInfo.timezone;
		if (!timezone) {
			return null;
		}
		
		// Get current time in the selected city's timezone
		const cityTime = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
		
		return {
			date: cityTime.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }),
			time: `${String(cityTime.getHours()).padStart(2, '0')}:${String(cityTime.getMinutes()).padStart(2, '0')}:${String(cityTime.getSeconds()).padStart(2, '0')}`
		};
	});

	let availableCitiesForAdd = $derived.by(() => {
		if (allCities.length === 0) return [];
		
		// Start with all cities that are not selected
		let filtered = allCities.filter(city => !selectedCityIds.includes(city.id));
		
		// Apply search filter if there's a search query
		if (addMoreSearchQuery.trim()) {
			filtered = searchCities(filtered, addMoreSearchQuery, countryNames);
		}
		
		// If not showing all, limit to DEFAULT_TIMEZONE_LIMIT
		if (!showAllTimezones) {
			return filtered.slice(0, DEFAULT_TIMEZONE_LIMIT);
		}
		
		// Return all filtered cities
		return filtered;
	});
</script>

<svelte:head>
	<title>{m.time_zone_converter()} - TimeUTCNow</title>
	<meta name="description" content="Free time zone converter tool for scheduling meetings with international teams. Convert UTC time or any city time to multiple time zones instantly. Perfect for coordinating global calls, webinars, and virtual events across different time zones." />
	<meta name="keywords" content="time zone converter, UTC converter, timezone converter, meeting scheduler, UTC clock, time conversion, international time, time zone calculator, UTC time converter, global time converter" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}/time-zone-converter" />
	<meta property="og:title" content="{m.time_zone_converter()} - TimeUTCNow" />
	<meta property="og:description" content="Free time zone converter tool for scheduling meetings with international teams. Convert UTC time or any city time to multiple time zones instantly." />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{m.time_zone_converter()} - TimeUTCNow" />
	<meta name="twitter:description" content="Free time zone converter tool for scheduling meetings with international teams. Convert UTC time or any city time to multiple time zones instantly." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/{page.params.locale}">
				<SiteLogo class="cursor-pointer" />
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a>
				<a href="/{page.params.locale}/time-zone-converter" class="hover:text-primary font-semibold">{m.time_zone_converter()}</a>
				<TimeFormatSelector bind:value={timeFormat} />
				<LanguageSwitcher />
			</div>

			<div class="md:hidden">
				<button
					type="button"
					class="btn btn-ghost btn-sm"
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>
	</nav>
	
	<!-- Mobile Sidebar -->
	{#if mobileMenuOpen}
		<div class="md:hidden fixed inset-0 z-[100] bg-base-100/95 backdrop-blur-md">
			<div class="flex flex-col h-full">
				<div class="flex items-center justify-between p-4 border-b border-base-300">
					<SiteLogo />
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						onclick={() => mobileMenuOpen = false}
						aria-label="Close menu"
					>
						<X class="w-6 h-6" />
					</button>
				</div>
				<div class="flex-1 overflow-y-auto p-4 space-y-4">
					<a
						href="/{page.params.locale}"
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.utc_clock()}
					</a>
					<a
						href="/{page.params.locale}/time-zone-converter"
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.time_zone_converter()}
					</a>
					<div class="pt-4 border-t border-base-300">
						<TimeFormatSelector bind:value={timeFormat} />
					</div>
				</div>
			</div>
		</div>
	{/if}

	<main class="max-w-6xl mx-auto px-4 py-8 md:py-12">
		<!-- Page Header -->
		<section class="text-center mb-12">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
				<Clock class="w-4 h-4" />
				{m.time_zone_converter()}
			</div>
			<h1 class="text-4xl md:text-5xl font-bold mb-4">Time Zone Converter</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto mb-2">
				Convert any time to multiple time zones instantly. Perfect for scheduling meetings with international teams, coordinating global calls, and finding convenient times across different time zones.
			</p>
			<p class="text-sm text-base-content/60 max-w-2xl mx-auto">
				Enter a time in UTC or select a city and time, then see the corresponding time in all your selected cities worldwide.
			</p>
		</section>

		<!-- Input Section -->
		<section class="bg-base-100 border border-base-300 rounded-3xl p-6 md:p-8 mb-8">
			<div class="mb-6">
				<label class="label pb-2">
					<span class="label-text font-semibold">Choose Input Type</span>
				</label>
				<div class="flex flex-col sm:flex-row gap-2">
					<button
						class="btn {inputMode === 'city' ? 'btn-primary' : 'btn-outline'} w-full sm:flex-initial h-12 sm:h-11 text-base"
						onclick={() => {
							inputMode = 'city';
							// Set to local timezone by default when switching to city mode
							if (!selectedCityId || selectedCityId === '') {
								selectedCityId = 'local';
							}
							citySearchQuery = '';
						}}
					>
						<Search class="w-4 h-4 mr-2" />
						City Time
					</button>
					<button
						class="btn {inputMode === 'utc' ? 'btn-primary' : 'btn-outline'} w-full sm:flex-initial h-12 sm:h-11 text-base"
						onclick={() => {
							inputMode = 'utc';
							selectedCityId = '';
							citySearchQuery = '';
						}}
					>
						<Clock class="w-4 h-4 mr-2" />
						UTC Time
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div>
					<label class="label py-0 pb-1">
						<span class="label-text font-semibold">Date</span>
					</label>
					<input
						type="date"
						class="input input-bordered w-full"
						value={inputDate}
						oninput={(e) => {
							inputDate = e.currentTarget.value;
						}}
					/>
				</div>
				<div>
					<label class="label py-0 pb-1">
						<span class="label-text font-semibold">Time</span>
					</label>
					<input
						type="time"
						step="1"
						class="input input-bordered w-full"
						value={inputTime}
						oninput={(e) => {
							inputTime = e.currentTarget.value;
						}}
					/>
				</div>
			</div>

			{#if inputMode === 'city'}
				<div class="mt-4">
					<label class="label">
						<span class="label-text font-semibold">Select City</span>
					</label>
					<div class="space-y-2">
						<!-- Local City Option -->
						<button
							class="w-full btn {selectedCityId === 'local' ? 'btn-primary' : 'btn-outline'} justify-start h-12 sm:h-11 text-base"
							onclick={() => {
								selectedCityId = 'local';
								citySearchQuery = '';
							}}
						>
							<Clock class="w-4 h-4 mr-2" />
							<span class="flex-1 text-left">My Local Time ({userTimezone})</span>
							{#if selectedCityId === 'local'}
								<Check class="w-4 h-4" />
							{/if}
						</button>

						<!-- City Search -->
						<div class="relative">
							<SearchInput
								placeholder="Or search for a city..."
								bind:value={citySearchQuery}
								onInput={(query) => {
									citySearchQuery = query;
								}}
							/>
							{#if citySearchQuery && citySearchResults.length > 0}
								<div class="absolute z-10 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
									<div class="p-2">
										{#each citySearchResults as city}
											<button
												class="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center justify-between transition-colors"
												onclick={() => {
													selectedCityId = city.id;
													citySearchQuery = '';
												}}
											>
												<div class="flex-1">
													<span class="font-medium">{city.name}</span>
													<span class="text-xs text-base-content/60 ml-2">
														{countryNames.get(city.country) || city.country}
													</span>
												</div>
												{#if selectedCityId === city.id}
													<Check class="w-4 h-4 text-primary ml-2" />
												{/if}
											</button>
										{/each}
									</div>
								</div>
							{:else if citySearchQuery && citySearchResults.length === 0}
								<div class="absolute z-10 w-full mt-2 bg-base-100 border border-base-300 rounded-lg p-3 text-sm text-base-content/60">
									No cities found. Try a different search term.
								</div>
							{/if}
						</div>

						{#if selectedCityInfo && selectedCityLocalTime}
							<div class="mt-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<Clock class="w-5 h-5 text-primary" />
										<h3 class="text-lg font-bold text-primary">
											{selectedCityInfo.name}
											{#if selectedCityInfo.country}
												<span class="text-sm font-normal text-base-content/70 ml-1">
													({selectedCityInfo.country})
												</span>
											{/if}
										</h3>
									</div>
								</div>
								<div class="space-y-2">
									<div class="text-sm text-base-content/60">
										Timezone: <span class="font-medium text-base-content">{selectedCityInfo.label}</span>
									</div>
									
									<!-- Selected Input Time and Current Time on same line -->
									<div class="pt-2 border-t border-primary/20">
										<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
											<!-- Selected Time (Left) -->
											<div class="w-full sm:flex-1 min-w-0">
												<div class="text-xs text-base-content/50 mb-1">Selected Time:</div>
												<div class="flex items-center gap-2 sm:gap-4 flex-nowrap">
													<div>
														<span class="text-xs text-base-content/60">Date:</span>
														<span class="ml-2 text-xs sm:text-base font-semibold text-base-content">
															{selectedCityLocalTime.date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
														</span>
													</div>
													<div>
														<span class="text-xs text-base-content/60">Time:</span>
														<span class="ml-2 text-xs sm:text-base font-semibold text-base-content">
															{selectedCityLocalTime.time}
														</span>
													</div>
												</div>
											</div>

											<!-- Current Time (Right) -->
											{#if selectedCityCurrentTime}
												<div class="w-full sm:flex-1 min-w-0 text-left">
													<div class="text-xs text-base-content/40 mb-1">Current Time:</div>
													<div class="flex items-center gap-2 sm:gap-4 flex-nowrap">
														<div>
															<span class="text-xs text-base-content/50">Date:</span>
															<span class="ml-2 text-xs sm:text-base text-base-content/70">
																{selectedCityCurrentTime.date}
															</span>
														</div>
														<div>
															<span class="text-xs text-base-content/50">Time:</span>
															<span class="ml-2 text-xs sm:text-base text-base-content/80 tabular-nums">
																{selectedCityCurrentTime.time}
															</span>
														</div>
													</div>
												</div>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</section>

		<!-- Cities Grid -->
		{#if cities.length > 0}
			<section class="mb-8">
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-2xl font-bold">Converted Times</h2>
						<p class="text-sm text-base-content/60 mt-1">
							{#if targetTime}
								Showing time in {cities.length} {cities.length === 1 ? 'city' : 'cities'}
								{#if cities.length > DEFAULT_TIMEZONE_LIMIT && !showAllTimezones}
									(displaying first {DEFAULT_TIMEZONE_LIMIT})
								{/if}
							{:else}
								Select a date and time above to see converted times
							{/if}
						</p>
					</div>
					{#if cities.length > DEFAULT_TIMEZONE_LIMIT}
						<button
							class="btn btn-sm btn-ghost"
							onclick={() => {
								showAllTimezones = !showAllTimezones;
							}}
						>
							{showAllTimezones ? 'Show Less' : `Show All (${cities.length})`}
						</button>
					{/if}
				</div>
				{#if targetTime}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{#each (showAllTimezones ? cities : cities.slice(0, DEFAULT_TIMEZONE_LIMIT)) as city}
							<ConverterCityCard
								{city}
								targetTime={targetTime}
								{timeFormat}
								showRemove={true}
								countryName={countryNames.get(city.country) || city.country}
								onRemove={() => removeCity(city.id)}
							/>
						{/each}
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each cities as city}
							<div class="card bg-base-100 border border-base-300">
								<div class="card-body p-5">
									<div class="flex justify-between items-start mb-4">
										<div class="flex-1">
											<h3 class="font-bold text-lg mb-1">{city.name}</h3>
											<p class="text-xs text-base-content/60">{city.name}, {countryNames.get(city.country) || city.country}</p>
										</div>
										<button
											type="button"
											class="btn btn-ghost btn-xs btn-circle"
											onclick={() => removeCity(city.id)}
											aria-label="Remove city"
										>
											<X class="w-4 h-4" />
										</button>
									</div>
									<div class="text-sm text-base-content/60">
										Enter date and time above to see converted time
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{:else}
			<section class="mb-8">
				<div class="alert alert-info">
					<p>No cities selected. Add cities from the section below to see converted times.</p>
				</div>
			</section>
		{/if}

		<!-- Add More Cities -->
		<section class="bg-base-100 border border-base-300 rounded-3xl p-6 md:p-8">
			<div class="mb-6">
				<h2 class="text-2xl font-bold mb-2">Add More Cities</h2>
				<p class="text-base-content/60 text-sm">Add cities to see converted times in different time zones</p>
			</div>

			<div class="mb-6">
				<SearchInput
					placeholder="Search for a city..."
					bind:value={addMoreSearchQuery}
					onInput={(query) => {
						addMoreSearchQuery = query;
					}}
					class="w-full md:w-64"
				/>
			</div>

			{#if availableCitiesForAdd.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#each availableCitiesForAdd as city (city.id)}
						<AddCityCard
							{city}
							currentTime={targetTime || new Date()}
							countryName={countryNames.get(city.country) || city.country}
							onAdd={() => addCity(city.id)}
						/>
					{/each}
				</div>
				
				{@const totalAvailable = addMoreSearchQuery.trim() 
					? searchCities(allCities.filter(city => !selectedCityIds.includes(city.id)), addMoreSearchQuery, countryNames).length
					: allCities.filter(city => !selectedCityIds.includes(city.id)).length}
				{@const showingCount = availableCitiesForAdd.length}
				
				{#if !showAllTimezones && showingCount < totalAvailable}
					<div class="text-center mt-8">
						<p class="text-sm text-base-content/60 mb-2">
							Showing {showingCount} of {totalAvailable} {addMoreSearchQuery.trim() ? 'results' : 'available cities'}
						</p>
						<button
							type="button"
							class="btn btn-primary"
							onclick={() => {
								showAllTimezones = true;
							}}
						>
							View All Cities
						</button>
					</div>
				{:else if showAllTimezones && showingCount > DEFAULT_TIMEZONE_LIMIT}
					<div class="text-center mt-8">
						<p class="text-sm text-base-content/60 mb-2">
							Showing all {showingCount} {addMoreSearchQuery.trim() ? 'results' : 'available cities'}
						</p>
						<button
							type="button"
							class="btn btn-ghost"
							onclick={() => {
								showAllTimezones = false;
							}}
						>
							Show Less
						</button>
					</div>
				{/if}
			{:else}
				<div class="text-center py-12 bg-base-200 rounded-2xl">
					<p class="text-base-content/60 mb-4">
						{#if addMoreSearchQuery.trim()}
							No cities found matching "{addMoreSearchQuery}"
						{:else}
							All cities have been added to your list.
						{/if}
					</p>
				</div>
			{/if}
		</section>

		<!-- SEO Content -->
		<section class="mt-16 bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
			<h2 class="text-3xl font-bold mb-6">Why Use a Time Zone Converter?</h2>
			<div class="space-y-4 text-primary-content/90">
				<p class="text-lg">
					Scheduling meetings with international teams can be challenging when team members are spread across different time zones. Our time zone converter makes it easy to find the perfect meeting time for everyone, regardless of where they are in the world.
				</p>
				<h3 class="text-xl font-semibold mt-6 mb-3">Perfect for:</h3>
				<ul class="space-y-3">
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Scheduling team meetings:</strong> Coordinate with team members across multiple time zones to find times that work for everyone. No more back-and-forth emails trying to figure out when 2 PM EST is in Tokyo or London.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Planning global conference calls:</strong> Quickly see what time your call will be in all participants' local times, making it easier to schedule and communicate meeting times.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Organizing webinars and virtual events:</strong> Find optimal times for your global audience by seeing how your event time translates across different regions.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Setting deadlines across time zones:</strong> When working with international clients or remote teams, ensure deadlines are clear by showing exactly when they occur in each team member's local time.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Coordinating with international clients:</strong> Professional communication means respecting time zones. Our converter helps you propose meeting times that work for both parties.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Planning recurring meetings:</strong> Set up regular meetings with global teams by finding times that consistently work across all time zones.
						</div>
					</li>
				</ul>
				<p class="mt-6">
					Simply enter a time in UTC (Coordinated Universal Time) or select a specific city and time, and our tool instantly shows you the corresponding time in all your selected cities worldwide. Add or remove cities as needed to customize your view for your specific team or project needs.
				</p>
				<h3 class="text-xl font-semibold mt-8 mb-3">How It Works</h3>
				<p class="text-lg">
					Our time zone converter uses the latest timezone database to ensure accuracy across all regions, including daylight saving time transitions. Simply choose your input method:
				</p>
				<ul class="space-y-3 mt-4">
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>UTC Time Mode:</strong> Enter a time in Coordinated Universal Time (UTC), the global standard for timekeeping. This is ideal for technical teams, developers, and anyone working with international systems.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>City Time Mode:</strong> Select a specific city and enter a local time. The converter will show you what that time corresponds to in all your selected cities. Perfect for scheduling meetings when you know your local time.
						</div>
					</li>
				</ul>
				<p class="text-lg mt-6">
					All conversions are calculated in real-time and account for daylight saving time changes, ensuring you always have the most accurate information for scheduling and planning.
				</p>
				<h3 class="text-xl font-semibold mt-8 mb-3">Benefits of Using Our Time Zone Converter</h3>
				<ul class="space-y-3 mt-4">
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>100% Free:</strong> No registration required, no hidden fees, and no limitations on usage. Use it as often as you need for personal or professional purposes.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Accurate and Up-to-Date:</strong> Our converter uses the official IANA timezone database, ensuring all conversions account for the latest timezone rules and daylight saving time changes.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Easy to Use:</strong> Intuitive interface that works on desktop, tablet, and mobile devices. No technical knowledge required.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Customizable:</strong> Add or remove cities from your conversion list to focus on the locations most relevant to your work or personal needs.
						</div>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0 mt-0.5">
							<Check class="w-3 h-3" />
						</div>
						<div>
							<strong>Works Offline:</strong> Once loaded, the converter works without an internet connection, making it perfect for travel or areas with limited connectivity.
						</div>
					</li>
				</ul>
			</div>
		</section>
	</main>

	<AppFooter />

	<!-- Toast Notification -->
	{#if copied}
		<div class="fixed bottom-8 right-8 bg-base-900 text-base-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
			<Check class="w-5 h-5 text-success" />
			<span class="font-semibold">{m.copied_to_clipboard()}</span>
		</div>
	{/if}
</div>
