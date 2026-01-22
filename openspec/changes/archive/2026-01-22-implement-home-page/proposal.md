# Change: Implement Home Page with UTC Time Display

## Why

The application needs a functional home page that displays real-time UTC time and provides a foundation for timezone-related features. The home page is the primary entry point for users and must showcase accurate UTC time with a modern, responsive UI. To ensure scalability and maintainability, timezone data (cities, countries, timezone information) should be stored in a structured JSON database format that can be easily extended and managed.

## What Changes

- Implement home page (`/` or `/[lang]/`) with live UTC time display
- Create JSON database structure for cities, countries, and timezone data
- Build reusable components for time display, city cards, and information sections
- Implement IndexedDB utilities for client-side data persistence (following project conventions)
- Add real-time clock updates (100ms intervals for smooth display)
- Display major cities with their current local times
- Include UTC time information, Unix timestamp, Julian date, and local time displays
- Add search functionality for cities/timezones
- Implement copy-to-clipboard functionality for UTC timestamps
- Create FAQ section with UTC-related information
- Add time format selection (12-hour AM/PM or 24-hour format)
- Create city selection page for customizable city displays
- Implement beautiful round analog clock display
- Add widget functionality for embedding multiple cities (suitable for hotels/public displays)
- Ensure full i18n support with Paraglide for all page content
- Add SEO-optimized meta tags and structured data (JSON-LD)
- Use DaisyUI components and Lucide Svelte icons throughout

## Impact

- **Affected specs**: New capability `home-page` will be created
- **Affected code**: 
  - `src/routes/+page.svelte` - Main home page component
  - `src/routes/[lang]/select-cities/+page.svelte` - City selection page
  - `src/routes/[lang]/widget/+page.svelte` - Widget creation page
  - `src/routes/[lang]/widget/[id]/+page.svelte` - Widget display page
  - `src/lib/components/` - New reusable components (clock, analog-clock, city-card, city-selector, time-format-selector, widget-display, info-card, etc.)
  - `src/lib/utils/` - Time utilities, IndexedDB utilities
  - `src/lib/types/` - TypeScript types for timezone data and user preferences
  - `src/lib/data/` - JSON database files for cities, countries, timezones
  - `messages/` - Translation files for home page, city selection, and widget pages
- **New dependencies**: None (using existing stack: SvelteKit, DaisyUI, Lucide Svelte)
- **Storage**: IndexedDB will be used for client-side caching of timezone data
