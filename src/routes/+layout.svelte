<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { locales, localizeHref, getLocale, setLocale } from '$lib/paraglide/runtime';
	import { getSavedLocale } from '$lib/utils/indexed-db-preferences';
	import { initLocaleStorage } from '$lib/utils/locale-storage';
	import './layout.css';

	let { children } = $props();

	// Set locale from URL immediately (before render) - URL takes priority
	// This ensures Paraglide uses the locale from the URL, not from cookie/IndexedDB
	$effect(() => {
		// Get locale from URL path (page.params.locale or first segment)
		const urlLocale = page.params?.locale || page.url.pathname.split('/').filter(Boolean)[0];
		
		if (urlLocale && locales.includes(urlLocale as any)) {
			// URL has a valid locale - set it immediately
			setLocale(urlLocale);
			// Sync cookie with URL locale
			if (typeof document !== 'undefined') {
				document.cookie = `PARAGLIDE_LOCALE=${urlLocale}; path=/; max-age=34560000`;
			}
		}
	});

	// Initialize custom locale strategy
	onMount(() => {
		initLocaleStorage();
	});

	// Sync IndexedDB with URL locale (runs after mount, doesn't affect initial render)
	onMount(async () => {
		try {
			// Get locale from URL
			const urlLocale = page.params?.locale || page.url.pathname.split('/').filter(Boolean)[0];
			const hasUrlLocale = urlLocale && locales.includes(urlLocale as any);
			
			if (hasUrlLocale) {
				// URL has a valid locale - sync IndexedDB with it
				const { saveLocale: saveLocaleToIndexedDB } = await import('$lib/utils/indexed-db-preferences');
				const savedLocale = await getSavedLocale();
				
				if (!savedLocale || savedLocale !== urlLocale) {
					try {
						await saveLocaleToIndexedDB(urlLocale);
					} catch (error) {
						console.error('Failed to save URL locale to IndexedDB:', error);
					}
				}
			} else {
				// No locale in URL - use saved locale from IndexedDB or default
				const savedLocale = await getSavedLocale();
				if (savedLocale && locales.includes(savedLocale as any)) {
					// Use saved locale and sync cookie
					if (typeof document !== 'undefined') {
						document.cookie = `PARAGLIDE_LOCALE=${savedLocale}; path=/; max-age=34560000`;
					}
					setLocale(savedLocale);
				}
			}
		} catch (error) {
			console.error('Failed to sync locale:', error);
		}
	});
</script>

<svelte:head><link rel="icon" href="/favicon.svg" /></svelte:head>

{@render children()}
<div style="display:none">
	{#each locales as locale}
		<a
			href={localizeHref(page.url.pathname, { locale })}
		>
			{locale}
		</a>
	{/each}
</div>
