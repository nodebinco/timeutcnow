<script lang="ts">
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { Sunrise, Moon, X } from 'lucide-svelte';
	import { isDayTime, getTimezoneOffset, formatTimezoneOffset, getCityTime } from '$lib/utils/timezone-utils';

	interface Props {
		city: City;
		targetTime: Date; // UTC time
		timeFormat: TimeFormat;
		showRemove?: boolean;
		countryName?: string;
		onRemove?: () => void;
		class?: string;
	}

	let {
		city,
		targetTime,
		timeFormat,
		showRemove = false,
		countryName,
		onRemove,
		class: className = ''
	}: Props = $props();

	// Convert UTC targetTime to this city's local time
	// Use formatter directly to get time components in the city's timezone
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: city.timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
	
	const cityTimeParts = $derived.by(() => {
		const parts = formatter.formatToParts(targetTime);
		console.log(`[ConverterCityCard] ${city.name} (${city.timezone}): UTC ${targetTime.toISOString()} -> parts:`, parts);
		return parts;
	});
	const cityHour = $derived(parseInt(cityTimeParts.find(p => p.type === 'hour')?.value || '0'));
	const cityMinute = $derived(parseInt(cityTimeParts.find(p => p.type === 'minute')?.value || '0'));
	const citySecond = $derived(parseInt(cityTimeParts.find(p => p.type === 'second')?.value || '0'));
	const cityYear = $derived(parseInt(cityTimeParts.find(p => p.type === 'year')?.value || '0'));
	const cityMonth = $derived(parseInt(cityTimeParts.find(p => p.type === 'month')?.value || '0') - 1);
	const cityDay = $derived(parseInt(cityTimeParts.find(p => p.type === 'day')?.value || '0'));
	
	$effect(() => {
		console.log(`[ConverterCityCard] ${city.name} (${city.timezone}): Displaying ${cityHour}:${cityMinute}:${citySecond} from UTC ${targetTime.toISOString()}`);
	});
	
	const isDay = $derived(isDayTime(targetTime, city.timezone));
	const utcOffset = $derived(getTimezoneOffset(city.timezone, targetTime));
	const offsetDisplay = $derived(formatTimezoneOffset(utcOffset));
	
	// Format date
	const dateDisplay = $derived(new Date(cityYear, cityMonth, cityDay).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
	
	// Format time with seconds using the timezone components directly
	const formatTimeWithSeconds = (hour: number, minute: number, second: number, format: TimeFormat): string => {
		if (format === '12h') {
			const ampm = hour >= 12 ? 'PM' : 'AM';
			const displayHours = hour % 12 || 12;
			return `${displayHours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`;
		}
		
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
	};
	
	const timeDisplay = $derived(formatTimeWithSeconds(cityHour, cityMinute, citySecond, timeFormat));
</script>

<div class="card bg-base-100 border border-base-300 hover:shadow-lg transition-all {className}">
	<div class="card-body p-5">
		<div class="flex justify-between items-start mb-4">
			<div class="flex-1">
				<h3 class="font-bold text-lg mb-1">{city.name}</h3>
				<p class="text-xs text-base-content/60">{city.name}, {countryName || city.country}</p>
			</div>
			<div>
				{#if isDay}
					<Sunrise class="w-5 h-5 text-warning" />
				{:else}
					<Moon class="w-5 h-5 text-info" />
				{/if}
			</div>
		</div>
		<div class="text-3xl font-bold tabular-nums text-primary mb-2">{timeDisplay}</div>
		<div class="flex items-center justify-between text-sm text-base-content/60 pt-2 border-t border-base-300">
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="font-medium">{dateDisplay}</span>
					<span class="text-xs">{offsetDisplay}</span>
				</div>
			</div>
			<div class="flex items-center gap-1">
				{#if showRemove && onRemove}
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-circle"
						onclick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						aria-label="Remove city"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
