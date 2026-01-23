<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Clock, Copy, Check, Settings, Info, ExternalLink, Search, Sunrise, Moon, Plus, Menu, X } from 'lucide-svelte';
	import UTCClock from '$lib/components/utc-clock.svelte';
	import InfoCard from '$lib/components/info-card.svelte';
	import CityCard from '$lib/components/city-card.svelte';
	import AddCityCard from '$lib/components/add-city-card.svelte';
	import SearchInput from '$lib/components/search-input.svelte';
	import TimeFormatSelector from '$lib/components/time-format-selector.svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { getTimezoneData, getUserPreferences, saveUserPreferences, getHomeSelectedCities, saveHomeSelectedCities } from '$lib/utils/indexed-db-utils';
	import { getUnixTimestamp, getJulianDate, getISO8601, getUTCOffset, formatUTCOffset, formatTime } from '$lib/utils/time-utils';
	import { searchCities, filterCitiesByIds, sortCitiesByOrder, isDayTime, getTimezoneOffset } from '$lib/utils/timezone-utils';
	import * as m from '$lib/paraglide/messages';

	let currentTime = $state(new Date());
	let copied = $state(false);
	let searchQuery = $state('');
	let timeFormat = $state<TimeFormat>('24h');
	let allCities = $state<City[]>([]);
	let selectedCityIds = $state<string[]>([]);
	let userTimezone = $state('');
	let showAddMore = $state(true);
	let addMoreSearchQuery = $state('');
	let showAllTimezones = $state(false); // Show 24 by default, user can click "Show More"
	const DEFAULT_TIMEZONE_LIMIT = 24;
	let mobileMenuOpen = $state(false);

	// Update clock every 100ms
	$effect(() => {
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 100);
		return () => clearInterval(timer);
	});

	// Load data on mount
	onMount(async () => {
		try {
			// Load timezone data
			const data = await getTimezoneData();
			allCities = data.cities;
			
			if (allCities.length === 0) {
				console.warn('⚠️ Homepage: No cities loaded! Check migration and database.');
				return;
			}
			
			// Create country names mapping
			const countryMap = new Map<string, string>();
			data.countries.forEach(country => {
				countryMap.set(country.code, country.name);
			});
			countryNames = countryMap;
			
			// Get user timezone
			userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			
			// Load user preferences for time format
			try {
				const prefs = await getUserPreferences();
				if (prefs && prefs.timeFormat) {
					timeFormat = prefs.timeFormat;
				}
			} catch (error) {
				console.error('❌ Failed to load user preferences:', error);
			}
			
			// Load home selected cities from IndexedDB
			let savedCities: string[] = [];
			try {
				savedCities = await getHomeSelectedCities();
			} catch (error) {
				console.error('❌ Failed to load home-selected-cities:', error);
			}
			
			if (savedCities.length > 0) {
				selectedCityIds = [...savedCities];
			} else {
				// Set default cities if none selected (16 major world cities)
				const defaultCities = [
					'london',        // London, UK
					'new-york',      // New York, USA
					'tokyo',         // Tokyo, Japan
					'dubai',         // Dubai, UAE
					'sydney',        // Sydney, Australia
					'paris',         // Paris, France
					'singapore',     // Singapore
					'hong-kong',     // Hong Kong
					'beijing',       // Beijing, China
					'mumbai',        // Mumbai, India
					'moscow',        // Moscow, Russia
					'los-angeles',   // Los Angeles, USA
					'bangkok',       // Bangkok, Thailand
					'seoul',         // Seoul, South Korea
					'istanbul',      // Istanbul, Turkey
					'cairo'          // Cairo, Egypt
				];
				selectedCityIds = [...defaultCities];
				
				try {
					await saveHomeSelectedCities(Array.from(selectedCityIds));
				} catch (error) {
					console.error('❌ Failed to save default cities:', error);
				}
			}
		} catch (error) {
			console.error('❌ onMount error:', error);
		}
	});

	// Use $derived to automatically compute cities based on dependencies
	let cities = $derived.by(() => {
		try {
			const selectedIds = Array.from(selectedCityIds);
			
			// If allCities is empty, return empty array (wait for onMount to load data)
			if (allCities.length === 0) {
				return [];
			}
			
			// If no cities selected, return empty array (wait for onMount to set default)
			if (selectedIds.length === 0) {
				return [];
			}
			
			let filtered = allCities;
			
			// Filter by selected cities
			if (selectedIds.length > 0) {
				filtered = filterCitiesByIds(filtered, selectedIds);
				
				if (filtered.length === 0) {
					console.warn('⚠️ No cities found after filtering! Check if city IDs match.');
				}
				
				// Sort by order if available
				filtered = sortCitiesByOrder(filtered, selectedIds);
			} else {
				filtered = [];
			}
			
			// Filter by search query
			if (searchQuery.trim()) {
				filtered = searchCities(filtered, searchQuery, countryNames);
			}
			
			return filtered;
		} catch (error) {
			console.error('❌ Failed to compute cities:', error);
			return [];
		}
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
		}
	}

	// Remove city from selection
	async function removeCity(cityId: string) {
		try {
			if (selectedCityIds.includes(cityId)) {
				selectedCityIds = selectedCityIds.filter(id => id !== cityId);
				await saveCityPreferences();
			}
		} catch (error) {
			console.error('❌ Failed to remove city:', error);
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
			const plainSelectedCities = Array.isArray(selectedCityIds) ? Array.from(selectedCityIds) : [];
			
			// Save to home-selected-cities key
			await saveHomeSelectedCities(plainSelectedCities);
			
			// Also save to user preferences for backward compatibility
			try {
				const prefs = await getUserPreferences();
				await saveUserPreferences({
					timeFormat: prefs?.timeFormat || timeFormat || '24h',
					selectedCities: plainSelectedCities,
					cityOrder: plainSelectedCities,
					widgetConfigs: prefs?.widgetConfigs
				});
			} catch (error) {
				console.error('⚠️ Failed to save to default preferences (non-critical):', error);
			}
		} catch (error) {
			console.error('❌ Failed to save city preferences:', error);
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
	<title>{m.live_utc_time()} - TimeUTCNow</title>
	<meta name="description" content="The world's most precise live UTC clock. Real-time UTC time display with major cities worldwide. Free UTC clock with timezone converter, Unix timestamp, and ISO 8601 format." />
	<meta name="keywords" content="UTC clock, UTC time, live UTC, timezone clock, UTC converter, international time, time zone, GMT time, coordinated universal time" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}" />
	<meta property="og:title" content="{m.live_utc_time()} - TimeUTCNow" />
	<meta property="og:description" content="The world's most precise live UTC clock. Real-time UTC time display with major cities worldwide." />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{m.live_utc_time()} - TimeUTCNow" />
	<meta name="twitter:description" content="The world's most precise live UTC clock. Real-time UTC time display with major cities worldwide." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<SiteLogo class="cursor-pointer" />
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a>
				<a href="/{page.params.locale}/time-zone-converter" class="hover:text-primary">{m.time_zone_converter()}</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
				<TimeFormatSelector value={timeFormat} onChange={handleTimeFormatChange} />
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
					<a
						href="/{page.params.locale}/converter"
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.converter()}
					</a>
					<div class="pt-4 border-t border-base-300">
						<TimeFormatSelector value={timeFormat} onChange={handleTimeFormatChange} />
					</div>
				</div>
			</div>
		</div>
	{/if}

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
					<span class="text-primary font-semibold">UTC {offsetStr}</span>
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
		<section class="max-w-6xl mx-auto mb-20">
			<h2 class="text-4xl font-bold mb-12 text-center">{m.faq_title()}</h2>
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
					<div class="collapse collapse-plus bg-base-100 border border-base-300 shadow-sm">
						<input type="checkbox" name="faq-accordion" />
						<div class="collapse-title text-xl font-bold">
							{faq.q}
						</div>
						<div class="collapse-content">
							<p class="text-base-content/70 leading-relaxed text-base">{faq.a}</p>
						</div>
					</div>
				{/each}
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
