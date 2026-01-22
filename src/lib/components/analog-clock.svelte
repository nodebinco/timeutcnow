<script lang="ts">
	interface Props {
		currentTime: Date;
		timezone?: string;
		size?: number;
		showLabels?: boolean;
		cityName?: string;
		class?: string;
	}

	let {
		currentTime,
		timezone,
		size = 200,
		showLabels = false,
		cityName,
		class: className = ''
	}: Props = $props();

	const targetTime = $derived(timezone
		? new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }))
		: currentTime);

	const hours = $derived(timezone ? targetTime.getHours() : targetTime.getUTCHours());
	const minutes = $derived(timezone ? targetTime.getMinutes() : targetTime.getUTCMinutes());
	const seconds = $derived(timezone ? targetTime.getSeconds() : targetTime.getUTCSeconds());

	// Calculate angles for clock hands
	const hourAngle = $derived((hours % 12) * 30 + minutes * 0.5); // 30 degrees per hour, 0.5 per minute
	const minuteAngle = $derived(minutes * 6 + seconds * 0.1); // 6 degrees per minute, 0.1 per second
	const secondAngle = $derived(seconds * 6); // 6 degrees per second

	const center = size / 2;
	const hourHandLength = size * 0.25;
	const minuteHandLength = size * 0.35;
	const secondHandLength = size * 0.4;
</script>

<div class="flex flex-col items-center {className}">
	<svg width={size} height={size} class="drop-shadow-lg">
		<!-- Clock face -->
		<circle cx={center} cy={center} r={center - 2} fill="currentColor" class="text-base-100" />
		<circle cx={center} cy={center} r={center - 2} fill="none" stroke="currentColor" stroke-width="2" class="text-base-content/20" />

		<!-- Hour markers -->
		{#each Array(12) as _, i}
			{@const angle = (i * 30 - 90) * (Math.PI / 180)}
			{@const x1 = center + (center - 10) * Math.cos(angle)}
			{@const y1 = center + (center - 10) * Math.sin(angle)}
			{@const x2 = center + (center - 2) * Math.cos(angle)}
			{@const y2 = center + (center - 2) * Math.sin(angle)}
			<line
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
				stroke="currentColor"
				stroke-width="2"
				class="text-base-content"
			/>
		{/each}

		<!-- Hour hand -->
		<g transform="translate({center}, {center}) rotate({hourAngle})">
			<line
				x1="0"
				y1="0"
				x2="0"
				y2={-hourHandLength}
				stroke="currentColor"
				stroke-width="4"
				stroke-linecap="round"
				class="text-base-content"
			/>
		</g>

		<!-- Minute hand -->
		<g transform="translate({center}, {center}) rotate({minuteAngle})">
			<line
				x1="0"
				y1="0"
				x2="0"
				y2={-minuteHandLength}
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				class="text-base-content"
			/>
		</g>

		<!-- Second hand -->
		<g transform="translate({center}, {center}) rotate({secondAngle})">
			<line
				x1="0"
				y1="0"
				x2="0"
				y2={-secondHandLength}
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				class="text-error"
			/>
		</g>

		<!-- Center dot -->
		<circle cx={center} cy={center} r="4" fill="currentColor" class="text-base-content" />
	</svg>
	{#if showLabels && cityName}
		<p class="mt-2 text-sm font-medium text-base-content/80">{cityName}</p>
	{/if}
</div>
