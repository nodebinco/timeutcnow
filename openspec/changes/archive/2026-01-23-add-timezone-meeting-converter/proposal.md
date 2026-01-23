# Change: Add Timezone Meeting Converter Page

## Why

Users need a dedicated tool for scheduling meetings across multiple time zones. Unlike the home page which displays current real-time UTC and city times, this page allows users to input a specific time (either UTC or for a specific city) and see what that time corresponds to in other cities. This is essential for coordinating meetings, calls, and events across different time zones. The page needs its own storage structure in IndexedDB to avoid conflicts with the home page's city preferences, as multiple pages may store different city lists for different purposes.

## What Changes

- Create new route `/[locale]/meeting-converter` for timezone meeting converter functionality
- Implement time input interface allowing users to enter:
  - UTC time (date and time)
  - Time for a specific city (date, time, and city selection)
- Display converted times for a list of selected cities showing:
  - Date and time in each city's local timezone
  - Day/night indicators
  - UTC offset information
- Add city selection interface to build a list of cities to display
- Implement IndexedDB storage with separate key structure to avoid conflicts with home page:
  - Store selected cities list for meeting converter page separately
  - Use distinct object store or key prefix to isolate from home page preferences
- Add real-time updates when input time changes
- Support time format selection (12-hour/24-hour)
- Include copy-to-clipboard functionality for each city's time
- Ensure full i18n support with Paraglide translations
- Add SEO-optimized content and meta tags
- Use DaisyUI components and Lucide Svelte icons

## Impact

- **Affected specs**: New capability `timezone-meeting-converter` will be created
- **Affected code**: 
  - `src/routes/[locale]/meeting-converter/+page.svelte` - Main meeting converter page
  - `src/lib/components/` - New or reused components (time-input, city-time-display, etc.)
  - `src/lib/utils/indexed-db-utils.ts` - Add functions for meeting converter city storage
  - `src/lib/types/timezone.ts` - Add types for meeting converter preferences
  - `src/lib/utils/time-utils.ts` - May need time conversion utilities
  - `messages/` - Translation files for meeting converter page
- **Storage**: IndexedDB will use separate key/object store structure to avoid conflicts with home page preferences
- **New dependencies**: None (using existing stack)
