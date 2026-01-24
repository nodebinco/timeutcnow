# Change: Fix Locale-Aware Links

## Why
Currently, when users select a language (e.g., Thai), navigation links throughout the application (sidebar, navbar, in-content links) still generate URLs with the default locale (`/en/xxx`) instead of respecting the currently selected locale (`/th/xxx`). This breaks the user experience as clicking links redirects users back to English content, forcing them to manually switch language again.

## What Changes
- **MODIFIED**: All navigation links (navbar, sidebar, footer, in-content) will use `localizeHref()` function to generate locale-aware URLs
- **MODIFIED**: Links will automatically respect the current locale from `getLocale()` instead of hardcoding `page.params.locale`
- **MODIFIED**: All internal links across all pages will be updated to use the proper localization function
- Links in the following components will be fixed:
  - Navigation bar links (desktop and mobile)
  - Footer links
  - In-content links within pages
  - Any other internal navigation links

## Impact
- **Affected specs**: `navigation` (new capability)
- **Affected code**: 
  - `src/routes/[locale]/+page.svelte` - Home page navigation
  - `src/routes/[locale]/about/+page.svelte` - About page navigation
  - `src/routes/[locale]/contact/+page.svelte` - Contact page navigation
  - `src/routes/[locale]/privacy/+page.svelte` - Privacy page navigation
  - `src/routes/[locale]/time-zone-converter/+page.svelte` - Converter page navigation
  - `src/routes/[locale]/meeting-converter/+page.svelte` - Meeting converter page navigation
  - `src/lib/components/app-footer.svelte` - Footer component
  - Any other components with internal links
