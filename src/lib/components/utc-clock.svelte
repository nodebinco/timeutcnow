<script lang="ts">
	import type { TimeFormat } from '$lib/types/timezone';
	import { formatTime, format24Hour, format12Hour } from '$lib/utils/time-utils';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		currentTime: Date;
		timeFormat: TimeFormat;
		showSeconds?: boolean;
		class?: string;
	}

	let {
		currentTime,
		timeFormat,
		showSeconds = true,
		class: className = ''
	}: Props = $props();

	const utcHours = $derived(currentTime.getUTCHours());
	const utcMinutes = $derived(currentTime.getUTCMinutes());
	const utcSeconds = $derived(currentTime.getUTCSeconds());
	
	const hours = $derived(timeFormat === '12h' 
		? ((utcHours % 12) || 12).toString().padStart(2, '0')
		: utcHours.toString().padStart(2, '0'));
	const minutes = $derived(utcMinutes.toString().padStart(2, '0'));
	const seconds = $derived(utcSeconds.toString().padStart(2, '0'));
	const ampm = $derived(timeFormat === '12h' ? (utcHours >= 12 ? 'PM' : 'AM') : '');
	
	const locale = $derived(getLocale());
	const dateString = $derived(currentTime.toLocaleDateString(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}));
</script>

<div class="text-center {className}">
	<h1 class="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 tabular-nums">
		{hours}:{minutes}{#if showSeconds}:<span class="text-primary">{seconds}</span>{/if}{#if ampm} <span class="text-base-content/60 text-4xl md:text-6xl lg:text-7xl">{ampm}</span>{/if}
	</h1>
	<p class="text-lg md:text-xl text-primary font-semibold mb-2">UTC</p>
	<p class="text-xl md:text-2xl text-base-content/60 font-medium mb-8">{dateString}</p>
</div>
