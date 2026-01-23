<script lang="ts">
	import type { City, TimeFormat } from '$lib/types/timezone';
	import { Sunrise, Moon, X, Copy } from 'lucide-svelte';
	import { isDayTime, getTimezoneOffset, formatTimezoneOffset, getCityTime } from '$lib/utils/timezone-utils';
	import { formatTimeShort } from '$lib/utils/time-utils';

	interface Props {
		city: City;
		targetTime: Date; // The static time to display (not live updating)
		timeFormat: TimeFormat;
		showRemove?: boolean;
		showCopy?: boolean;
		countryName?: string;
		onRemove?: () => void;
		onCopy?: () => void;
		class?: string;
	}

	let {
		city,
		targetTime,
		timeFormat,
		showRemove = false,
		showCopy = false,
		countryName,
		onRemove,
		onCopy,
		class: className = ''
	}: Props = $props();

	// Convert the target time to this city's timezone
	// Use getCityTime which properly converts UTC to city timezone
	const cityTime = $derived(getCityTime(targetTime, city.timezone));
	const isDay = $derived(isDayTime(targetTime, city.timezone));
	const timeDisplay = $derived(formatTimeShort(cityTime, timeFormat));
	const utcOffset = $derived(getTimezoneOffset(city.timezone, targetTime));
	const offsetDisplay = $derived(formatTimezoneOffset(utcOffset));
	const dateDisplay = $derived(cityTime.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
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
			<div class="flex items-center gap-2">
				<span class="font-medium">{dateDisplay}</span>
				<span class="text-xs">{offsetDisplay}</span>
			</div>
			<div class="flex items-center gap-1">
				{#if showCopy && onCopy}
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-circle"
						onclick={(e) => {
							e.stopPropagation();
							onCopy();
						}}
						aria-label="Copy time"
					>
						<Copy class="w-4 h-4" />
					</button>
				{/if}
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
