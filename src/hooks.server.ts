import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { isLocale } from '$lib/paraglide/runtime';

const handleParaglide: Handle = ({ event, resolve }) => {
	// Extract locale from URL path before Paraglide middleware
	// This ensures URL locale takes priority over cookie/other strategies
	const url = new URL(event.request.url);
	const pathSegments = url.pathname.split('/').filter(Boolean);
	const urlLocale = pathSegments[0];
	
	// If URL has a valid locale, set it in the cookie before Paraglide reads it
	if (urlLocale && isLocale(urlLocale)) {
		// Set cookie with URL locale so Paraglide will use it
		const cookieHeader = event.request.headers.get('cookie') || '';
		const newCookie = `PARAGLIDE_LOCALE=${urlLocale}; path=/; max-age=34560000`;
		
		// Update the request with the locale cookie
		const headers = new Headers(event.request.headers);
		headers.set('cookie', cookieHeader ? `${cookieHeader}; ${newCookie}` : newCookie);
		
		// Create new request with updated headers
		event.request = new Request(event.request, { headers });
	}
	
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};

export const handle: Handle = handleParaglide;
