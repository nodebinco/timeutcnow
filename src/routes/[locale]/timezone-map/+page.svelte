<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Clock, Copy, Check, Search, Sunrise, Moon, Plus, X } from 'lucide-svelte';
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
	let allCities = $state<City[]>([]);
	let selectedCityIds = $state<string[]>([]);
	let copied = $state(false);
	let addMoreSearchQuery = $state('');
	let countryNames = $state<Map<string, string>>(new Map());
	let targetTime = $state<Date | null>(null);
	let showAllTimezones = $state(false);
	const DEFAULT_TIMEZONE_LIMIT = 24;

	// Update target time when input changes
	$effect(() => {
		if (inputMode === 'utc') {
			if (inputDate && inputTime) {
				const dateTimeStr = `${inputDate}T${inputTime}:00Z`;
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
				const city = allCities.find(c => c.id === selectedCityId);
				if (city) {
					const utcTime = convertCityTimeToUTC(inputDate, inputTime, city.timezone);
					if (utcTime) {
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
					if (meetingPrefs.lastInputTime) {
						inputMode = meetingPrefs.lastInputTime.type;
						if (meetingPrefs.lastInputTime.type === 'city') {
							selectedCityId = meetingPrefs.lastInputTime.cityId || '';
						}
						if (meetingPrefs.lastInputTime.time) {
							const date = new Date(meetingPrefs.lastInputTime.time);
							inputDate = date.toISOString().split('T')[0];
							inputTime = date.toTimeString().split(' ')[0].slice(0, 5);
						}
					}
				}
			} catch (error) {
				console.error('❌ Failed to load meeting converter preferences:', error);
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
		if (targetTime) {
			return filteredCities;
		}
		return [];
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
		if (inputDate && inputTime) {
			const prefs = await getMeetingConverterPreferences();
			await saveMeetingConverterPreferences({
				selectedCities: prefs?.selectedCities || Array.from(selectedCityIds),
				cityOrder: prefs?.cityOrder || Array.from(selectedCityIds),
				lastInputTime: {
					type: inputMode,
					time: targetTime ? targetTime.toISOString() : '',
					cityId: inputMode === 'city' ? selectedCityId : undefined
				}
			});
		}
	}

	$effect(() => {
		handleInputChange();
	});

	let searchResults = $derived.by(() => {
		if (!addMoreSearchQuery.trim()) {
			return [];
		}
		return searchCities(allCities, addMoreSearchQuery, countryNames).slice(0, 10);
	});
</script>

<svelte:head>
	<title>{m.site_name()} - {m.timezone_map()}</title>
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
				<a href="/{page.params.locale}/timezone-map" class="hover:text-primary font-semibold">{m.timezone_map()}</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
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
				{m.timezone_map()}
			</div>
			<h1 class="text-4xl md:text-5xl font-bold mb-4">Convert Time Across Time Zones</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
				Enter a time in UTC or any city, and instantly see what time it is in cities around the world.
			</p>
		</section>

		<!-- Input Section -->
		<section class="bg-base-100 rounded-3xl p-6 md:p-8 mb-8 shadow-lg">
			<div class="flex flex-col md:flex-row gap-4 mb-6">
				<div class="flex gap-2">
					<button
						class="btn btn-sm {inputMode === 'utc' ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => {
							inputMode = 'utc';
							selectedCityId = '';
						}}
					>
						UTC Time
					</button>
					<button
						class="btn btn-sm {inputMode === 'city' ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => {
							inputMode = 'city';
						}}
					>
						City Time
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="md:col-span-1">
					<TimeInput
						label="Date"
						type="date"
						value={inputDate}
						onChange={(value) => {
							inputDate = value;
						}}
					/>
				</div>
				<div class="md:col-span-1">
					<TimeInput
						label="Time"
						type="time"
						value={inputTime}
						onChange={(value) => {
							inputTime = value;
						}}
					/>
				</div>
				{#if inputMode === 'city'}
					<div class="md:col-span-1">
						<SearchInput
							placeholder="Select city..."
							value={selectedCityId ? allCities.find(c => c.id === selectedCityId)?.name || '' : ''}
							onSearch={(query) => {
								addMoreSearchQuery = query;
							}}
						/>
						{#if addMoreSearchQuery && searchResults.length > 0}
							<div class="mt-2 bg-base-200 rounded-lg p-2 max-h-60 overflow-y-auto">
								{#each searchResults as city}
									<button
										class="w-full text-left px-3 py-2 hover:bg-base-300 rounded flex items-center justify-between"
										onclick={() => {
											selectedCityId = city.id;
											addMoreSearchQuery = '';
										}}
									>
										<span>{city.name}, {countryNames.get(city.country) || city.country}</span>
										{#if selectedCityId === city.id}
											<Check class="w-4 h-4 text-primary" />
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<!-- Cities Grid -->
		{#if targetTime}
			<section class="mb-8">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-bold">Time in Selected Cities</h2>
					<button
						class="btn btn-sm btn-ghost"
						onclick={() => {
							showAllTimezones = !showAllTimezones;
						}}
					>
						{showAllTimezones ? 'Show Less' : 'Show More'}
					</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each (showAllTimezones ? cities : cities.slice(0, DEFAULT_TIMEZONE_LIMIT)) as city}
						{@const cityTime = convertUTCToCity(targetTime, city.timezone)}
						{@const isDay = isDayTime(cityTime, city.timezone)}
						<MeetingCityCard
							{city}
							time={cityTime}
							{timeFormat}
							{isDay}
							countryName={countryNames.get(city.country) || city.country}
							onRemove={() => removeCity(city.id)}
						/>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Add More Cities -->
		<section class="bg-base-100 rounded-3xl p-6 md:p-8 shadow-lg">
			<h2 class="text-2xl font-bold mb-6">Add More Cities</h2>
			<SearchInput
				placeholder="Search for a city..."
				value={addMoreSearchQuery}
				onSearch={(query) => {
					addMoreSearchQuery = query;
				}}
			/>
			{#if addMoreSearchQuery && searchResults.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
					{#each searchResults as city}
						{#if !selectedCityIds.includes(city.id)}
							<AddCityCard
								{city}
								countryName={countryNames.get(city.country) || city.country}
								onAdd={() => addCity(city.id)}
							/>
						{/if}
					{/each}
				</div>
			{/if}
		</section>

		<!-- SEO Content -->
		<section class="mt-16 bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
			<h2 class="text-3xl font-bold mb-6">Why Use a Timezone Map?</h2>
			<div class="space-y-4 text-primary-content/90">
				<p>
					Scheduling meetings across multiple time zones can be challenging. Our meeting time converter makes it easy to find the perfect time for everyone, regardless of where they are in the world.
				</p>
				<p>
					Whether you're planning a global conference call, coordinating with international clients, or simply curious about what time it is in different parts of the world, our timezone map provides instant, accurate conversions.
				</p>
				<p>
					Simply enter a time in UTC or select a city and time, and our tool will show you the corresponding time in all your selected cities. Add or remove cities as needed to customize your view.
				</p>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="bg-base-300 mt-20 py-12">
		<div class="max-w-6xl mx-auto px-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<h4 class="font-bold mb-4">About</h4>
					<p class="text-sm text-base-content/60">
						{m.site_name()} provides accurate, real-time UTC clock and timezone conversion tools for professionals and travelers worldwide.
					</p>
				</div>
				<div>
					<h4 class="font-bold mb-4">Tools</h4>
					<ul class="space-y-2 text-sm text-base-content/60">
						<li><a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a></li>
						<li><a href="/{page.params.locale}/timezone-map" class="hover:text-primary">{m.timezone_map()}</a></li>
						<li><a href="/{page.params.locale}/unix-timestamp" class="hover:text-primary">{m.unix_converter()}</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4">Support</h4>
					<ul class="space-y-2 text-sm text-base-content/60">
						<li><a href="/{page.params.locale}/about" class="hover:text-primary">{m.about_us()}</a></li>
						<li><a href="/{page.params.locale}/privacy" class="hover:text-primary">{m.privacy_policy()}</a></li>
					</ul>
				</div>
			</div>
			<div class="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-base-300 text-center text-xs text-base-content/40">
				© {new Date().getFullYear()} {m.site_name()}. {m.footer_copyright()}
			</div>
		</div>
	</footer>

	<!-- Toast Notification -->
	{#if copied}
		<div class="fixed bottom-8 right-8 bg-base-900 text-base-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
			<Check class="w-5 h-5 text-success" />
			<span class="font-semibold">{m.copied_to_clipboard()}</span>
		</div>
	{/if}
</div>
