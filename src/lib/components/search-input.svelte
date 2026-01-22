<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { debounce } from '$lib/utils/debounce';

	interface Props {
		placeholder?: string;
		value?: string;
		onInput?: (value: string) => void;
		class?: string;
	}

	let {
		placeholder = 'Search...',
		value = $bindable(''),
		onInput,
		class: className = ''
	}: Props = $props();

	let inputElement: HTMLInputElement;

	const debouncedInput = debounce((val: string) => {
		onInput?.(val);
	}, 150); // Reduced debounce time for better responsiveness

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		// Call onInput immediately for reactive updates, debounced for performance
		onInput?.(value);
		debouncedInput(value);
	}
</script>

<div class="relative {className}">
	<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
	<input
		bind:this={inputElement}
		type="text"
		{placeholder}
		{value}
		oninput={handleInput}
		class="input input-bordered w-full pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
	/>
</div>
