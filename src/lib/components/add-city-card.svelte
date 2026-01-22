<script lang="ts">
	import type { City } from '$lib/types/timezone';
	import { Plus, Check } from 'lucide-svelte';
	import { getTimezoneOffset, formatTimezoneOffset } from '$lib/utils/timezone-utils';

	interface Props {
		city: City;
		currentTime: Date;
		countryName?: string;
		onAdd?: () => void;
		class?: string;
	}

	let { city, currentTime, countryName, onAdd, class: className = '' }: Props = $props();
	let added = $state(false);

	const utcOffset = $derived(getTimezoneOffset(city.timezone, currentTime));
	const offsetDisplay = $derived(formatTimezoneOffset(utcOffset));

	function handleAdd() {
		if (onAdd) {
			onAdd();
			added = true;
			setTimeout(() => {
				added = false;
			}, 2000);
		}
	}
</script>

<div 
	class="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all cursor-pointer {className} {added ? 'ring-2 ring-primary' : ''}" 
	role="button"
	tabindex="0"
	onclick={handleAdd}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleAdd();
		}
	}}
	aria-label="Add {city.name} to timezone converter"
>
	<div class="card-body p-4">
		<div class="flex items-center justify-between">
			<div class="flex-1 min-w-0">
				<h4 class="font-semibold text-base mb-1 truncate">{city.name}</h4>
				<p class="text-xs text-base-content/60 truncate">{countryName || city.country}</p>
				<p class="text-xs text-primary font-medium mt-1">{offsetDisplay}</p>
			</div>
			{#if onAdd}
				<button
					type="button"
					class="btn {added ? 'btn-success' : 'btn-primary'} btn-circle btn-sm shrink-0 ml-3"
					onclick={(e) => {
						e.stopPropagation();
						handleAdd();
					}}
					aria-label="Add city"
				>
					{#if added}
						<Check class="w-4 h-4" />
					{:else}
						<Plus class="w-4 h-4" />
					{/if}
				</button>
			{/if}
		</div>
	</div>
</div>
