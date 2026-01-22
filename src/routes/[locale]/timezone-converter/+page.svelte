<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Clock, Copy, Check, Search, Sunrise, Moon, Plus } from 'lucide-svelte';
	import TimeInput from '$lib/components/time-input.svelte';
	import MeetingCityCard from '$lib/components/meeting-city-card.svelte';
	import AddCityCard from '$lib/components/add-city-card.svelte';
	import SearchInput from '$lib/components/search-input.svelte';
	import TimeFormatSelector from '$lib/components/time-format-selector.svelte';
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { getTimezoneData, getMeetingConverterPreferences, saveMeetingConverterPreferences, getUserPreferences } from '$lib/utils/indexed-db-utils';
	import { formatTime } from '$lib/utils/time-utils';
	import { searchCities, filterCitiesByIds, sortCitiesByOrder, isDayTime, convertCityTimeToUTC, convertUTCToCity } from '$lib/utils/timezone-utils';
	import * as m from '$lib/paraglide/messages';

	type InputMode = 'utc' | 'city';

	let timeFormat = $state<TimeFormat>('24h');
	let inputMode = $state<InputMode>('utc');
	let inputDate = $state('');
	let inputTime = $state('');
	let selectedCityId = $state<string>('');
	let cities = $state<City[]>([]);
	let allCities = $state<City[]>([]);
	let selectedCityIds = $state<string[]>([]);
	let copied = $state(false);
	let addMoreSearchQuery = $state('');
	let countryNames = $state<Map<string, string>>(new Map());
	let targetTime = $state<Date | null>(null);
	let showAllTimezones = $state(false);
	const DEFAULT_TIMEZONE_LIMIT = 24;

	// Initialize with current date/time
	onMount(async () => {
		const now = new Date();
		inputDate = now.toISOString().split('T')[0];
		inputTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
		
		// Load timezone data
		const data = await getTimezoneData();
		allCities = data.cities;
		
		// Create country names mapping
		const countryMap = new Map<string, string>();
		data.countries.forEach(country => {
			countryMap.set(country.code, country.name);
		});
		countryNames = countryMap;
		
		// Load user preferences for time format
		const prefs = await getUserPreferences();
		if (prefs?.timeFormat) {
			timeFormat = prefs.timeFormat;
		}
		
		// Load meeting converter preferences
		const meetingPrefs = await getMeetingConverterPreferences();
		if (meetingPrefs) {
			if (meetingPrefs.selectedCities && meetingPrefs.selectedCities.length > 0) {
				selectedCityIds = meetingPrefs.selectedCities;
			}
			if (meetingPrefs.lastInputTime) {
				inputMode = meetingPrefs.lastInputTime.type;
				inputDate = new Date(meetingPrefs.lastInputTime.time).toISOString().split('T')[0];
				inputTime = new Date(meetingPrefs.lastInputTime.time).toTimeString().slice(0, 5);
				if (meetingPrefs.lastInputTime.cityId) {
					selectedCityId = meetingPrefs.lastInputTime.cityId;
				}
			}
		}
		
		updateCities();
		updateTargetTime();
	});

	// Update cities list
	function updateCities() {
		try {
			let filtered = allCities;
			
			if (selectedCityIds.length > 0) {
				filtered = filterCitiesByIds(filtered, selectedCityIds);
				filtered = sortCitiesByOrder(filtered, selectedCityIds);
			} else {
				filtered = [];
			}
			
			cities = filtered;
		} catch (error) {
			console.error('Failed to update cities:', error);
			cities = [];
		}
	}

	// Update target time based on input
	function updateTargetTime() {
		if (!inputDate || !inputTime) {
			targetTime = null;
			return;
		}
		
		try {
			const [year, month, day] = inputDate.split('-').map(Number);
			const [hours, minutes] = inputTime.split(':').map(Number);
			
			if (inputMode === 'utc') {
				// Create UTC date
				targetTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
			} else if (inputMode === 'city' && selectedCityId) {
				// Create date in selected city's timezone, then convert to UTC
				const city = allCities.find(c => c.id === selectedCityId);
				if (city) {
					// Create a date object with local components (representing city time)
					const localDate = new Date(year, month - 1, day, hours, minutes, 0);
					targetTime = convertCityTimeToUTC(localDate, city.timezone);
				} else {
					targetTime = null;
				}
			} else {
				targetTime = null;
			}
		} catch (error) {
			console.error('Failed to update target time:', error);
			targetTime = null;
		}
	}

	// Watch for input changes and update target time
	$effect(() => {
		// Track only the input values that affect target time
		inputDate;
		inputTime;
		inputMode;
		selectedCityId;
		updateTargetTime();
	});

	// Watch for target time changes and save preferences (debounced)
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		// Track target time and selected cities for saving
		targetTime;
		selectedCityIds;
		inputMode;
		selectedCityId;
		
		// Debounce saves to prevent excessive writes
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}
		saveTimeout = setTimeout(() => {
			savePreferences();
		}, 500);
		
		return () => {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
		};
	});

	// Save preferences
	async function savePreferences() {
		try {
			const lastInputTime = targetTime ? {
				type: inputMode,
				time: targetTime.toISOString(),
				cityId: inputMode === 'city' ? selectedCityId : undefined
			} : undefined;
			
			await saveMeetingConverterPreferences({
				selectedCities: [...selectedCityIds],
				cityOrder: [...selectedCityIds],
				lastInputTime
			});
		} catch (error) {
			console.error('Failed to save preferences:', error);
		}
	}

	// Add city
	async function addCity(cityId: string) {
		if (!selectedCityIds.includes(cityId)) {
			selectedCityIds = [...selectedCityIds, cityId];
			updateCities();
			await savePreferences();
		}
	}

	// Remove city
	async function removeCity(cityId: string) {
		if (selectedCityIds.includes(cityId)) {
			selectedCityIds = selectedCityIds.filter(id => id !== cityId);
			if (inputMode === 'city' && selectedCityId === cityId) {
				selectedCityId = '';
			}
			await savePreferences();
			updateCities();
			updateTargetTime();
		}
	}

	// Copy city time
	async function copyCityTime(city: City) {
		if (!targetTime) return;
		
		const cityTime = convertUTCToCity(targetTime, city.timezone);
		const timeStr = formatTime(cityTime, timeFormat, city.timezone);
		const dateStr = cityTime.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
		const fullStr = `${timeStr} on ${dateStr} (${city.label})`;
		
		try {
			await navigator.clipboard.writeText(fullStr);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Get available cities (not selected) - similar to home page
	const allAvailableCities = $derived.by(() => {
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
	<title>{m.site_name()} - Time Zone Converter</title>
	<meta name="description" content="Convert times across multiple time zones. Enter a UTC time or city time and see what it corresponds to in other cities worldwide." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/{page.params.locale}" class="flex items-center gap-2 cursor-pointer">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Clock class="text-primary-content w-5 h-5" />
				</div>
				<span class="font-bold text-xl tracking-tight">{m.site_name()}</span>
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.world_clock()}</a>
				<a href="/{page.params.locale}/timezone-converter" class="hover:text-primary font-semibold">Time Zone Converter</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
				<a href="/{page.params.locale}/api" class="hover:text-primary">{m.api()}</a>
				<TimeFormatSelector bind:value={timeFormat} />
			</div>

			<div class="md:hidden">
				<button class="btn btn-ghost btn-sm">
					<Clock class="w-5 h-5" />
				</button>
			</div>
		</div>
	</nav>

	<main class="max-w-6xl mx-auto px-4 py-8 md:py-12">
		<!-- Page Header -->
		<section class="text-center mb-12">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
				<Clock class="w-4 h-4" />
				Time Zone Converter
			</div>
			<h1 class="text-4xl md:text-5xl font-bold mb-4">Convert Time Across Time Zones</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
				Enter a time in UTC or for a specific city, and see what it corresponds to in other cities around the world. Perfect for coordinating meetings, calls, and events across multiple time zones.
			</p>
		</section>

		<!-- Time Input Section -->
		<section class="mb-12">
			<TimeInput
				mode={inputMode}
				date={inputDate}
				time={inputTime}
				selectedCityId={selectedCityId}
				availableCities={allCities}
				onModeChange={(mode) => {
					inputMode = mode;
					if (mode === 'utc') {
						selectedCityId = '';
					}
					updateTargetTime();
				}}
				onDateChange={(date) => {
					inputDate = date;
					updateTargetTime();
				}}
				onTimeChange={(time) => {
					inputTime = time;
					updateTargetTime();
				}}
				onCityChange={(cityId) => {
					selectedCityId = cityId;
					updateTargetTime();
				}}
			/>
		</section>

		<!-- Converted Times Display -->
		{#if targetTime && cities.length > 0}
			<section class="mb-12">
				<h2 class="text-2xl font-bold mb-6">Converted Times</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#each cities as city (city.id)}
						<MeetingCityCard
							{city}
							targetTime={targetTime}
							{timeFormat}
							showRemove={true}
							showCopy={true}
							countryName={countryNames.get(city.country)}
							onRemove={() => removeCity(city.id)}
							onCopy={() => copyCityTime(city)}
						/>
					{/each}
				</div>
			</section>
		{:else if targetTime && cities.length === 0}
			<section class="mb-12">
				<div class="alert alert-info">
					<p>No cities selected. Add cities from the list below to see converted times.</p>
				</div>
			</section>
		{/if}

		<!-- Add Cities Section -->
		<section class="border-t border-base-300 pt-12">
			<div class="mb-6">
				<h2 class="text-2xl font-bold mb-2">Add Cities</h2>
				<p class="text-base-content/60 text-sm">Select cities to display converted times</p>
			</div>

			<div class="mb-6">
				<SearchInput
					placeholder={m.search_city_placeholder()}
					bind:value={addMoreSearchQuery}
					class="w-full md:w-64"
				/>
			</div>

			{#if allAvailableCities.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#each allAvailableCities as city (city.id)}
						<AddCityCard
							{city}
							currentTime={targetTime || new Date()}
							countryName={countryNames.get(city.country)}
							onAdd={() => addCity(city.id)}
						/>
					{/each}
				</div>
				
				{@const totalAvailable = addMoreSearchQuery.trim() 
					? searchCities(allCities.filter(city => !selectedCityIds.includes(city.id)), addMoreSearchQuery, countryNames).length
					: allCities.filter(city => !selectedCityIds.includes(city.id)).length}
				{@const showingCount = allAvailableCities.length}
				
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
							{(m as any).view_all_timezones()}
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
				<p>
					Scheduling meetings across multiple time zones can be challenging. Our meeting time converter makes it easy to find the perfect time for everyone, regardless of where they are in the world.
				</p>
				<p>
					Simply enter a time in UTC or for a specific city, and instantly see what that time corresponds to in other cities. This is especially useful for:
				</p>
				<ul class="list-disc list-inside space-y-2 ml-4">
					<li>Coordinating international team meetings</li>
					<li>Planning video calls across continents</li>
					<li>Scheduling webinars with global audiences</li>
					<li>Organizing virtual events</li>
					<li>Setting deadlines that work for everyone</li>
				</ul>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-base-300 py-12 bg-base-200 mt-20">
		<div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
			<div class="col-span-2">
				<div class="flex items-center gap-2 mb-4">
					<div class="w-6 h-6 bg-primary rounded flex items-center justify-center">
						<Clock class="text-primary-content w-4 h-4" />
					</div>
					<span class="font-bold text-lg">{m.site_name()}</span>
				</div>
				<p class="text-base-content/60 text-sm max-w-xs mb-6">
					{m.footer_tagline()}
				</p>
			</div>
			<div>
				<h4 class="font-bold mb-4">Tools</h4>
				<ul class="space-y-2 text-sm text-base-content/60">
					<li><a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a></li>
					<li><a href="/{page.params.locale}/timezone-converter" class="hover:text-primary">Time Zone Converter</a></li>
					<li><a href="/{page.params.locale}/unix-timestamp" class="hover:text-primary">{m.unix_converter()}</a></li>
				</ul>
			</div>
			<div>
				<h4 class="font-bold mb-4">Support</h4>
				<ul class="space-y-2 text-sm text-base-content/60">
					<li><a href="/{page.params.locale}/api" class="hover:text-primary">{m.api_documentation()}</a></li>
					<li><a href="/{page.params.locale}/about" class="hover:text-primary">{m.about_us()}</a></li>
					<li><a href="/{page.params.locale}/privacy" class="hover:text-primary">{m.privacy_policy()}</a></li>
				</ul>
			</div>
		</div>
		<div class="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-base-300 text-center text-xs text-base-content/40">
			© {new Date().getFullYear()} {m.site_name()}. {m.footer_copyright()}
		</div>
	</footer>

	<!-- Toast Notification -->
	{#if copied}
		<div class="fixed bottom-8 right-8 bg-base-900 text-base-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
			<Check class="w-5 h-5 text-success" />
			<span class="font-semibold">{m.copied_to_clipboard()}</span>
		</div>
	{/if}
</div>
