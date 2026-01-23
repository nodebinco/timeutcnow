<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref, getLocale, setLocale } from '$lib/paraglide/runtime';
	import { saveLocale } from '$lib/utils/indexed-db-preferences';
	import { Globe, ChevronDown } from 'lucide-svelte';
	
	let dropdownOpen = $state(false);
	
	const languageNames: Record<string, string> = {
		en: 'English',
		es: 'Español',
		th: 'ไทย',
		zh: '中文',
		hi: 'हिन्दी',
		ar: 'العربية',
		pt: 'Português',
		ru: 'Русский',
		ja: '日本語',
		fr: 'Français',
		de: 'Deutsch',
		it: 'Italiano',
		ko: '한국어',
		tr: 'Türkçe',
		vi: 'Tiếng Việt',
		pl: 'Polski',
		nl: 'Nederlands',
		id: 'Bahasa Indonesia'
	};
	
	const currentLocale = $derived(getLocale());
	const currentLanguageName = $derived(languageNames[currentLocale] || currentLocale);
	
	async function handleLanguageChange(locale: string) {
		if (locale === currentLocale) {
			closeDropdown();
			return;
		}
		
		try {
			// Save locale to IndexedDB first
			await saveLocale(locale);
			
			// Also sync with cookie for paraglide
			document.cookie = `PARAGLIDE_LOCALE=${locale}; path=/; max-age=34560000`;
			
			// Use setLocale which will handle URL change and reload
			setLocale(locale, { reload: true });
		} catch (error) {
			console.error('Failed to change language:', error);
			// Fallback to URL navigation
			const currentPath = page.url.pathname;
			const newPath = localizeHref(currentPath, { locale });
			window.location.href = newPath;
		}
	}
	
	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}
	
	function closeDropdown() {
		dropdownOpen = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="btn btn-ghost btn-sm gap-2"
		onclick={toggleDropdown}
		aria-label="Change language"
		aria-expanded={dropdownOpen}
		aria-haspopup="true"
	>
		<Globe class="w-4 h-4" />
		<span class="hidden sm:inline">{currentLanguageName}</span>
		<span class="sm:hidden">{currentLocale.toUpperCase()}</span>
		<ChevronDown class="w-3 h-3 transition-transform {dropdownOpen ? 'rotate-180' : ''}" />
	</button>
	
	{#if dropdownOpen}
		<!-- Backdrop to close dropdown -->
		<div
			class="fixed inset-0 z-40"
			onclick={closeDropdown}
			role="button"
			tabindex="-1"
			aria-label="Close language menu"
		></div>
		
		<!-- Dropdown menu -->
		<div
			class="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50 max-h-96 overflow-y-auto"
			role="menu"
			aria-orientation="vertical"
		>
			{#each locales as locale}
				<a
					href={localizeHref(page.url.pathname, { locale })}
					class="block px-4 py-2 text-sm hover:bg-base-200 transition-colors {locale === currentLocale ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content'}"
					role="menuitem"
					onclick={(e) => {
						if (locale !== currentLocale) {
							e.preventDefault();
							handleLanguageChange(locale);
						} else {
							closeDropdown();
						}
					}}
				>
					<div class="flex items-center justify-between">
						<span>{languageNames[locale] || locale}</span>
						{#if locale === currentLocale}
							<span class="text-primary">✓</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Ensure dropdown appears above other content */
	:global(.relative) {
		position: relative;
	}
</style>
