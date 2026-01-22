import { extractLocaleFromUrl, baseLocale, isLocale } from '$lib/paraglide/runtime';

export const reroute = (request) => {
	const url = new URL(request.url);
	const pathSegments = url.pathname.split('/').filter(Boolean);
	
	// Check if first segment is a locale
	if (pathSegments.length > 0 && isLocale(pathSegments[0])) {
		// If it's a locale, keep the pathname as is for SvelteKit routing
		// SvelteKit will match it with [locale] route parameter
		return url.pathname;
	}
	
	// If no locale prefix, add base locale prefix to match [locale] route
	// This ensures / redirects to /en which matches [locale]/+page.svelte
	return `/${baseLocale}${url.pathname === '/' ? '' : url.pathname}`;
};
