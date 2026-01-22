<script lang="ts">
	import type { TimeFormat } from '$lib/types/timezone';
	import { saveUserPreferences, getUserPreferences } from '$lib/utils/indexed-db-utils';

	interface Props {
		value?: TimeFormat;
		onChange?: (format: TimeFormat) => void;
		class?: string;
	}

	let {
		value = $bindable('24h' as TimeFormat),
		onChange,
		class: className = ''
	}: Props = $props();

	async function handleChange(format: TimeFormat) {
		try {
			value = format;
			onChange?.(format);
			
			// Save to IndexedDB
			const prefs = await getUserPreferences();
			await saveUserPreferences({
				timeFormat: format,
				selectedCities: Array.isArray(prefs?.selectedCities) ? [...prefs.selectedCities] : [],
				cityOrder: Array.isArray(prefs?.cityOrder) ? [...prefs.cityOrder] : prefs?.selectedCities ? [...prefs.selectedCities] : [],
				widgetConfigs: prefs?.widgetConfigs
			});
		} catch (error) {
			console.error('Failed to save time format:', error);
		}
	}
</script>

<div class="flex items-center gap-2 {className}">
	<button
		type="button"
		class="btn btn-sm {value === '12h' ? 'btn-primary' : 'btn-ghost'}"
		onclick={() => handleChange('12h')}
	>
		12h
	</button>
	<button
		type="button"
		class="btn btn-sm {value === '24h' ? 'btn-primary' : 'btn-ghost'}"
		onclick={() => handleChange('24h')}
	>
		24h
	</button>
</div>
