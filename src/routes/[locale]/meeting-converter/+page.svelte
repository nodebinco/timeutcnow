<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { Clock, Copy, Check, Search, Sunrise, Moon, Plus } from 'lucide-svelte';
	import TimeInput from '$lib/components/time-input.svelte';
	import MeetingCityCard from '$lib/components/meeting-city-card.svelte';
	import AddCityCard from '$lib/components/add-city-card.svelte';
	import SearchInput from '$lib/components/search-input.svelte';
	import TimeFormatSelector from '$lib/components/time-format-selector.svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
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

	// Watch for input changes
	$effect(() => {
		updateTargetTime();
		savePreferences();
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
			await savePreferences();
			updateCities();
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
		const locale = getLocale();
		const dateStr = cityTime.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
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

	// Get available cities (not selected)
	const availableCities = $derived.by(() => {
		if (allCities.length === 0) return [];
		let filtered = allCities.filter(city => !selectedCityIds.includes(city.id));
		if (addMoreSearchQuery.trim()) {
			filtered = searchCities(filtered, addMoreSearchQuery, countryNames);
		}
		return filtered;
	});
</script>

<svelte:head>
	<title>Time Zone Converter - TimeUTCNow</title>
	<meta name="description" content="Convert times across multiple time zones. Enter a UTC time or city time and see what it corresponds to in other cities worldwide. Perfect for scheduling international meetings." />
	<meta name="keywords" content="time zone converter, UTC converter, meeting scheduler, UTC clock, time conversion, international time, time zone calculator, UTC time converter, global time converter" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}/meeting-converter" />
	<meta property="og:title" content="Time Zone Converter - TimeUTCNow" />
	<meta property="og:description" content="Convert times across multiple time zones. Enter a UTC time or city time and see what it corresponds to in other cities worldwide." />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Time Zone Converter - TimeUTCNow" />
	<meta name="twitter:description" content="Convert times across multiple time zones. Enter a UTC time or city time and see what it corresponds to in other cities worldwide." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href={localizeHref("/")}>
				<SiteLogo class="cursor-pointer" />
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href={localizeHref("/")} class="hover:text-primary">{m.utc_clock()}</a>
				<a href={localizeHref("/meeting-converter")} class="hover:text-primary font-semibold">Time Zone Converter</a>
				<TimeFormatSelector bind:value={timeFormat} />
				<LanguageSwitcher />
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

			{#if availableCities.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#each availableCities.slice(0, 24) as city (city.id)}
						<AddCityCard
							{city}
							currentTime={targetTime || new Date()}
							countryName={countryNames.get(city.country)}
							onAdd={() => addCity(city.id)}
						/>
					{/each}
				</div>
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

	<AppFooter />

	<!-- Toast Notification -->
	{#if copied}
		<div class="fixed bottom-8 right-8 bg-base-900 text-base-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
			<Check class="w-5 h-5 text-success" />
			<span class="font-semibold">{m.copied_to_clipboard()}</span>
		</div>
	{/if}
</div>
