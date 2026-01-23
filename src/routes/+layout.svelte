<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { locales, localizeHref, getLocale, setLocale } from '$lib/paraglide/runtime';
	import { getSavedLocale } from '$lib/utils/indexed-db-preferences';
	import { initLocaleStorage } from '$lib/utils/locale-storage';
	import './layout.css';

	let { children } = $props();

	// Initialize custom locale strategy
	onMount(() => {
		initLocaleStorage();
	});

	// Load saved locale from IndexedDB on mount and sync with cookie
	onMount(async () => {
		try {
			const savedLocale = await getSavedLocale();
			if (savedLocale) {
				const currentLocale = getLocale();
				// Only change if different from current
				if (savedLocale !== currentLocale) {
					// Check if saved locale is valid
					if (locales.includes(savedLocale as any)) {
						// Sync cookie with IndexedDB for paraglide
						document.cookie = `PARAGLIDE_LOCALE=${savedLocale}; path=/; max-age=34560000`;
						
						// Update URL if needed - check if URL locale matches saved locale
						const currentPath = page.url.pathname;
						const pathSegments = currentPath.split('/').filter(Boolean);
						const urlLocale = pathSegments[0];
						
						// If URL locale doesn't match saved locale, redirect
						if (urlLocale !== savedLocale && locales.includes(urlLocale as any)) {
							// Redirect to correct locale URL
							const newPath = '/' + savedLocale + currentPath.substring(`/${urlLocale}`.length);
							if (newPath !== currentPath) {
								window.location.href = newPath;
								return;
							}
						}
					}
				} else {
					// Sync cookie with current locale if it's already correct
					document.cookie = `PARAGLIDE_LOCALE=${currentLocale}; path=/; max-age=34560000`;
				}
			} else {
				// If no saved locale, save current locale to IndexedDB
				const currentLocale = getLocale();
				try {
					const { saveLocale: saveLocaleToIndexedDB } = await import('$lib/utils/indexed-db-preferences');
					await saveLocaleToIndexedDB(currentLocale);
				} catch (error) {
					console.error('Failed to save current locale:', error);
				}
			}
		} catch (error) {
			console.error('Failed to load saved locale:', error);
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
