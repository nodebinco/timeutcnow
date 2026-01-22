<script lang="ts">
	import type { City } from '$lib/types/timezone';
	import { Calendar, Clock } from 'lucide-svelte';

	interface Props {
		mode: 'utc' | 'city';
		date: string; // YYYY-MM-DD
		time: string; // HH:mm
		selectedCityId?: string;
		availableCities: City[];
		onModeChange: (mode: 'utc' | 'city') => void;
		onDateChange: (date: string) => void;
		onTimeChange: (time: string) => void;
		onCityChange: (cityId: string) => void;
		class?: string;
	}

	let {
		mode,
		date,
		time,
		selectedCityId,
		availableCities,
		onModeChange,
		onDateChange,
		onTimeChange,
		onCityChange,
		class: className = ''
	}: Props = $props();

	const selectedCity = $derived(availableCities.find(c => c.id === selectedCityId));
</script>

<div class="card bg-base-100 border border-base-300 {className}">
	<div class="card-body p-6">
		<div class="mb-4">
			<label class="label">
				<span class="label-text font-semibold">Input Mode</span>
			</label>
			<div class="join w-full">
				<button
					type="button"
					class="join-item btn flex-1 {mode === 'utc' ? 'btn-primary' : 'btn-outline'}"
					onclick={() => onModeChange('utc')}
				>
					UTC Time
				</button>
				<button
					type="button"
					class="join-item btn flex-1 {mode === 'city' ? 'btn-primary' : 'btn-outline'}"
					onclick={() => onModeChange('city')}
				>
					City Time
				</button>
			</div>
		</div>

		{#if mode === 'city'}
			<div class="mb-4">
				<label class="label">
					<span class="label-text font-semibold">City</span>
				</label>
				<select
					class="select select-bordered w-full"
					value={selectedCityId || ''}
					onchange={(e) => onCityChange(e.currentTarget.value)}
				>
					<option value="">Select a city</option>
					{#each availableCities as city}
						<option value={city.id}>{city.name}, {city.label}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="label">
					<span class="label-text font-semibold flex items-center gap-2">
						<Calendar class="w-4 h-4" />
						Date
					</span>
				</label>
				<input
					type="date"
					class="input input-bordered w-full"
					value={date}
					oninput={(e) => onDateChange(e.currentTarget.value)}
				/>
			</div>
			<div>
				<label class="label">
					<span class="label-text font-semibold flex items-center gap-2">
						<Clock class="w-4 h-4" />
						Time
					</span>
				</label>
				<input
					type="time"
					class="input input-bordered w-full"
					value={time}
					oninput={(e) => onTimeChange(e.currentTarget.value)}
				/>
			</div>
		</div>

		{#if mode === 'city' && selectedCity}
			<div class="mt-4 p-3 bg-base-200 rounded-lg">
				<p class="text-sm text-base-content/60">
					Enter the time in <strong>{selectedCity.name}</strong> ({selectedCity.label})
				</p>
			</div>
		{:else if mode === 'utc'}
			<div class="mt-4 p-3 bg-base-200 rounded-lg">
				<p class="text-sm text-base-content/60">
					Enter the time in <strong>UTC</strong> (Coordinated Universal Time)
				</p>
			</div>
		{/if}
	</div>
</div>
