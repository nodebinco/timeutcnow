<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Clock, Copy, Check, Settings, Info, ExternalLink, Search, Sunrise, Moon, Plus } from 'lucide-svelte';
	import UTCClock from '$lib/components/utc-clock.svelte';
	import InfoCard from '$lib/components/info-card.svelte';
	import CityCard from '$lib/components/city-card.svelte';
	import AddCityCard from '$lib/components/add-city-card.svelte';
	import SearchInput from '$lib/components/search-input.svelte';
	import TimeFormatSelector from '$lib/components/time-format-selector.svelte';
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { getTimezoneData, getUserPreferences, saveUserPreferences } from '$lib/utils/indexed-db-utils';
	import { getUnixTimestamp, getJulianDate, getISO8601, getUTCOffset, formatUTCOffset, formatTime } from '$lib/utils/time-utils';
	import { searchCities, filterCitiesByIds, sortCitiesByOrder, isDayTime, getTimezoneOffset } from '$lib/utils/timezone-utils';
	import * as m from '$lib/paraglide/messages';

	let currentTime = $state(new Date());
	let copied = $state(false);
	let searchQuery = $state('');
	let timeFormat = $state<TimeFormat>('24h');
	let cities = $state<City[]>([]);
	let allCities = $state<City[]>([]);
	let selectedCityIds = $state<string[]>([]);
	let userTimezone = $state('');
	let showAddMore = $state(true);
	let addMoreSearchQuery = $state('');
	let showAllTimezones = $state(false); // Show 24 by default, user can click "Show More"
	const DEFAULT_TIMEZONE_LIMIT = 24;

	// Update clock every 100ms
	$effect(() => {
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 100);
		return () => clearInterval(timer);
	});

	// Load data on mount
	onMount(async () => {
		// Load timezone data
		const data = await getTimezoneData();
		allCities = data.cities;
		
		// Debug: Log the number of cities loaded
		console.log('Loaded cities:', allCities.length);
		
		// Create country names mapping
		const countryMap = new Map<string, string>();
		data.countries.forEach(country => {
			countryMap.set(country.code, country.name);
		});
		countryNames = countryMap;
		
		// Get user timezone first
		userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		
		// Load user preferences
		const prefs = await getUserPreferences();
		if (prefs) {
			if (prefs.timeFormat) {
				timeFormat = prefs.timeFormat;
			}
			if (prefs.selectedCities && prefs.selectedCities.length > 0) {
				selectedCityIds = prefs.selectedCities;
			}
		}
		
		// Set default cities if none selected
		if (selectedCityIds.length === 0) {
			selectedCityIds = ['london', 'new-york', 'tokyo', 'dubai', 'sydney', 'san-francisco'];
			await saveCityPreferences();
		}
		
		updateCities();
	});

	// Update cities based on search and selection
	function updateCities() {
		try {
			let filtered = allCities;
			
			// Filter by selected cities
			if (selectedCityIds.length > 0) {
				filtered = filterCitiesByIds(filtered, selectedCityIds);
				// Sort by order if available
				filtered = sortCitiesByOrder(filtered, selectedCityIds);
			} else {
				// If no cities selected, show empty array
				filtered = [];
			}
			
			// Filter by search query
			if (searchQuery.trim()) {
				filtered = searchCities(filtered, searchQuery, countryNames);
			}
			
			cities = filtered;
		} catch (error) {
			console.error('Failed to update cities:', error);
			cities = [];
		}
	}

	// Watch for search query changes
	$effect(() => {
		updateCities();
	});

	// Watch for selected cities changes
	$effect(() => {
		updateCities();
	});

	// Copy to clipboard
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

	// Handle time format change
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

	// Add city to selection
	async function addCity(cityId: string) {
		if (!selectedCityIds.includes(cityId)) {
			selectedCityIds = [...selectedCityIds, cityId];
			await saveCityPreferences();
			updateCities();
		}
	}

	// Remove city from selection
	async function removeCity(cityId: string) {
		try {
			if (selectedCityIds.includes(cityId)) {
				selectedCityIds = selectedCityIds.filter(id => id !== cityId);
				await saveCityPreferences();
				updateCities();
			}
		} catch (error) {
			console.error('Failed to remove city:', error);
		}
	}

	// Copy city time
	async function copyCityTime(city: City) {
		const cityTime = new Date(currentTime.toLocaleString('en-US', { timeZone: city.timezone }));
		const timeStr = formatTime(cityTime, timeFormat, city.timezone);
		await handleCopy(timeStr);
	}

	// Save city preferences
	async function saveCityPreferences() {
		try {
			const prefs = await getUserPreferences();
			// Create plain arrays from Svelte runes
			const plainSelectedCities = Array.isArray(selectedCityIds) ? [...selectedCityIds] : [];
			await saveUserPreferences({
				timeFormat: prefs?.timeFormat || '24h',
				selectedCities: plainSelectedCities,
				cityOrder: plainSelectedCities,
				widgetConfigs: prefs?.widgetConfigs
			});
		} catch (error) {
			console.error('Failed to save city preferences:', error);
		}
	}

	// Get country names mapping
	let countryNames = $state<Map<string, string>>(new Map());

	// Get available cities (not selected)
	const availableCities = $derived.by(() => {
		if (allCities.length === 0) return [];
		let filtered = allCities.filter(city => !selectedCityIds.includes(city.id));
		if (addMoreSearchQuery.trim()) {
			filtered = searchCities(filtered, addMoreSearchQuery, countryNames);
		}
		return filtered;
	});

	// Get all cities for "View all timezones"
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

	// Computed values
	const utcIso = $derived(getISO8601(currentTime));
	const utcTimestamp = $derived(getUnixTimestamp(currentTime));
	const julianDate = $derived(getJulianDate(currentTime).toFixed(5));
	
	// Get local time and offset for user's timezone
	const localTimeDate = $derived(userTimezone ? new Date(currentTime.toLocaleString('en-US', { timeZone: userTimezone })) : currentTime);
	const localOffset = $derived(userTimezone ? getTimezoneOffset(userTimezone, currentTime) : getUTCOffset(currentTime));
	const offsetStr = $derived(formatUTCOffset(localOffset));
	const localTime = $derived(userTimezone ? formatTime(currentTime, timeFormat, userTimezone) : formatTime(currentTime, timeFormat));
	const localTimeForCopy = $derived(userTimezone ? formatTime(currentTime, timeFormat, userTimezone) : formatTime(currentTime, timeFormat));
</script>

<svelte:head>
	<title>{m.site_name()} - {m.live_utc_time()}</title>
	<meta name="description" content="The world's most precise live UTC clock. Real-time UTC time display with major cities worldwide." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-2 cursor-pointer">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Clock class="text-primary-content w-5 h-5" />
				</div>
				<span class="font-bold text-xl tracking-tight">{m.site_name()}</span>
			</div>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.world_clock()}</a>
				<a href="/{page.params.locale}/timezone-converter" class="hover:text-primary">Time Zone Converter</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
				<a href="/{page.params.locale}/api" class="hover:text-primary">{m.api()}</a>
				<TimeFormatSelector value={timeFormat} onChange={handleTimeFormatChange} />
			</div>

			<div class="md:hidden">
				<Settings class="w-6 h-6 text-base-content/60" />
			</div>
		</div>
	</nav>

	<main class="max-w-6xl mx-auto px-4 py-8 md:py-12">
		<!-- Main Hero Clock Section -->
		<section class="text-center mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-pulse">
				<span class="w-2 h-2 rounded-full bg-primary"></span>
				{m.live_utc_time()}
			</div>
			
			<UTCClock {currentTime} {timeFormat} />
			
			{#if userTimezone}
				{@const isLocalDay = isDayTime(currentTime, userTimezone)}
				<p class="mt-6 mb-4 text-sm text-base-content/60 flex items-center justify-center gap-2 flex-wrap">
					<span>Your Local Timezone</span>
					<span class="font-semibold text-base-content">{localTime}</span>
					<span>UTC {offsetStr}</span>
					<span>{userTimezone}</span>
					{#if isLocalDay}
						<Sunrise class="w-5 h-5 text-warning" />
					{:else}
						<Moon class="w-5 h-5 text-info" />
					{/if}
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-circle"
						onclick={() => handleCopy(localTimeForCopy)}
						aria-label="Copy local time"
					>
						<Copy class="w-4 h-4" />
					</button>
				</p>
			{/if}
		</section>

		<!-- Current Time by Timezone Section -->
		<section class="mb-20">
			{#if cities.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
					{#each cities as city (city.id)}
						<CityCard
							{city}
							{currentTime}
							{timeFormat}
							showRemove={true}
							showCopy={true}
							countryName={countryNames.get(city.country)}
							onRemove={() => removeCity(city.id)}
							onCopy={() => copyCityTime(city)}
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12 bg-base-200 rounded-2xl">
					<p class="text-base-content/60 mb-4">No cities selected. Add cities from the list below.</p>
				</div>
			{/if}

			<!-- Add More Timezones Section -->
			<div class="border-t border-base-300 pt-8 mt-12">
				<div class="mb-6">
					<h3 class="text-2xl font-bold mb-2">{(m as any).add_more_timezones()}</h3>
					<p class="text-base-content/60 text-sm">{(m as any).current_time_by_timezone_description()}</p>
				</div>

				<div class="mb-6">
					<SearchInput
						placeholder={m.search_city_placeholder()}
						bind:value={addMoreSearchQuery}
						onInput={(val) => {
							addMoreSearchQuery = val;
						}}
						class="w-full md:w-64"
					/>
				</div>

				{#if allAvailableCities.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{#each allAvailableCities as city (city.id)}
							<AddCityCard
								{city}
								{currentTime}
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
			</div>
		</section>

		<!-- SEO/Educational Content -->
		<section class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content mb-16 overflow-hidden relative">
			<div class="relative z-10">
				<div class="mb-8">
					<h2 class="text-4xl font-bold mb-6">{m.what_is_utc()}</h2>
					<div class="text-primary-content/90 text-lg leading-relaxed space-y-4">
						<p>
							{m.what_is_utc_intro()}
						</p>
						<p>
							{m.what_is_utc_detail_1()}
						</p>
						<p>
							{m.what_is_utc_detail_2()}
						</p>
					</div>
					<ul class="space-y-4 mt-6">
						{#each [
							"No daylight saving time shifts - UTC remains constant year-round",
							"Standard for aviation and weather reporting worldwide",
							"Synchronizes global computer servers and distributed systems",
							"High precision based on atomic clocks with leap second adjustments",
							"Used by GPS satellites and international space stations",
							"Essential for financial markets and global trading"
						] as item}
							<li class="flex items-center gap-3">
								<div class="w-5 h-5 rounded-full bg-primary-content/30 flex items-center justify-center shrink-0">
									<Check class="w-3 h-3" />
								</div>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div class="mt-8 pt-8 border-t border-primary-content/20">
					<h3 class="text-2xl font-bold mb-4">{m.why_utc_matters()}</h3>
					<p class="text-primary-content/90 leading-relaxed">
						{m.why_utc_matters_text()}
					</p>
				</div>
			</div>
		</section>

		<!-- Bottom Content / FAQ -->
		<section class="max-w-3xl mx-auto mb-20">
			<h2 class="text-3xl font-bold mb-8 text-center">{m.faq_title()}</h2>
			<div class="space-y-4">
				{#each [
					{ q: m.faq_utc_gmt_q(), a: m.faq_utc_gmt_a() },
					{ q: m.faq_convert_q(), a: m.faq_convert_a() },
					{ q: m.faq_servers_q(), a: m.faq_servers_a() },
					{ q: m.faq_leap_seconds_q(), a: m.faq_leap_seconds_a() },
					{ q: m.faq_accuracy_q(), a: m.faq_accuracy_a() },
					{ q: m.faq_personal_q(), a: m.faq_personal_a() },
					{ q: m.faq_zulu_q(), a: m.faq_zulu_a() },
					{ q: m.faq_timezones_q(), a: m.faq_timezones_a() }
				] as faq, index}
					<div class="collapse collapse-plus bg-base-100 border border-base-300">
						<input type="checkbox" name="faq-accordion" />
						<div class="collapse-title text-lg font-bold">
							{faq.q}
						</div>
						<div class="collapse-content">
							<p class="text-base-content/60 leading-relaxed">{faq.a}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>

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
					<li><a href="/{page.params.locale}/unix-timestamp" class="hover:text-primary">{m.unix_converter()}</a></li>
					<li><a href="/{page.params.locale}/timezone-map" class="hover:text-primary">{m.timezone_map()}</a></li>
					<li><a href="/{page.params.locale}/date-calculator" class="hover:text-primary">{m.date_calculator()}</a></li>
				</ul>
			</div>
			<div>
				<h4 class="font-bold mb-4">Support</h4>
				<ul class="space-y-2 text-sm text-base-content/60">
					<li><a href="/{page.params.locale}/about" class="hover:text-primary">{m.about_us()}</a></li>
					<li><a href="/{page.params.locale}/privacy" class="hover:text-primary">{m.privacy_policy()}</a></li>
					<li><a href="/{page.params.locale}/contact" class="hover:text-primary">{m.contact()}</a></li>
				</ul>
			</div>
		</div>
		<div class="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-base-300 text-center text-xs text-base-content/40">
			© {new Date().getFullYear()} {m.site_name()}. {m.footer_copyright()}
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
