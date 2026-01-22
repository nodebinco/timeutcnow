## 1. Data Structure & Types

- [ ] 1.1 Create TypeScript types for timezone data (`src/lib/types/timezone.ts`)
  - Define `City`, `Country`, `Timezone` interfaces
  - Define `TimezoneData` structure for JSON database
  - Define `UserPreferences` interface (time format, selected cities, widget config)
- [ ] 1.2 Create JSON database structure for cities (`src/lib/data/cities.json`)
  - Include major cities with timezone IANA names
  - Include city name, country, timezone, label (e.g., "BST/GMT")
- [ ] 1.3 Create JSON database structure for countries (`src/lib/data/countries.json`)
  - Include country codes, names, and primary timezones
- [ ] 1.4 Create JSON database structure for timezones (`src/lib/data/timezones.json`)
  - Include timezone IANA names, UTC offsets, abbreviations (EST, UTC, etc.)
  - Include DST information where applicable

## 2. Utilities & Helpers

- [ ] 2.1 Create time utilities (`src/lib/utils/time-utils.ts`)
  - Functions for UTC time formatting
  - Functions for 12-hour (AM/PM) and 24-hour format conversion
  - Unix timestamp conversion
  - Julian date calculation
  - Timezone offset calculations
- [ ] 2.2 Create IndexedDB utilities (`src/lib/utils/indexed-db-utils.ts`)
  - Database initialization
  - Functions to store/retrieve timezone data
  - Cache management for JSON database data
  - Functions to store/retrieve user preferences (time format, selected cities)
  - Functions to store/retrieve widget configurations
- [ ] 2.3 Create timezone utilities (`src/lib/utils/timezone-utils.ts`)
  - Functions to get city time from timezone
  - Timezone search/filter functions
  - Day/night detection for cities

## 3. Reusable Components

- [ ] 3.1 Create UTC clock component (`src/lib/components/utc-clock.svelte`)
  - Large display of UTC time (hours:minutes:seconds)
  - Real-time updates (100ms intervals)
  - Date display below time
  - Support for 12-hour and 24-hour format selection
- [ ] 3.2 Create analog clock component (`src/lib/components/analog-clock.svelte`)
  - Round analog clock with hour, minute, second hands
  - SVG-based implementation for clean rendering
  - Smooth animations using CSS transforms
  - Support for displaying UTC or city time
  - Clean, minimal design suitable for public displays
- [ ] 3.3 Create info card component (`src/lib/components/info-card.svelte`)
  - Reusable card for displaying time-related information
  - Support for badges, copy buttons, icons
- [ ] 3.4 Create city card component (`src/lib/components/city-card.svelte`)
  - Display city name, timezone label, current time
  - Day/night indicator (sunrise/moon icons)
  - Responsive grid layout support
  - Support for 12-hour and 24-hour format
- [ ] 3.5 Create city selector component (`src/lib/components/city-selector.svelte`)
  - List of cities with checkboxes or toggle buttons
  - Search/filter functionality
  - Drag-and-drop reordering support
  - Save selected cities to IndexedDB
- [ ] 3.6 Create time format selector component (`src/lib/components/time-format-selector.svelte`)
  - Toggle between 12-hour (AM/PM) and 24-hour format
  - Save preference to IndexedDB
  - Apply format to all time displays
- [ ] 3.7 Create widget display component (`src/lib/components/widget-display.svelte`)
  - Display multiple cities in clean grid layout
  - Support for digital and analog clock views
  - Minimal branding, optimized for public displays
  - Fullscreen mode support
- [ ] 3.8 Create search input component (`src/lib/components/search-input.svelte`)
  - Search functionality for cities/timezones
  - Debounced input handling

## 4. Home Page Implementation

- [ ] 4.1 Create main home page component (`src/routes/+page.svelte`)
  - Import and use all reusable components
  - Implement real-time clock state management
  - Add navigation header with logo and menu
  - Implement copy-to-clipboard functionality
  - Integrate time format selector
  - Load and apply user preferences from IndexedDB
- [ ] 4.2 Add hero section with UTC clock
  - Large UTC time display
  - Live indicator badge
  - Copy ISO 8601 button
  - Embed widget button (placeholder)
- [ ] 4.3 Add secondary info grid
  - Local time card with UTC offset
  - Unix timestamp card with copy
  - Julian date card with info icon
- [ ] 4.4 Add major cities section
  - Grid of city cards
  - Search functionality
  - Filter cities based on search query
- [ ] 4.5 Add educational content section
  - "What is UTC?" section with information
  - FAQ section with expandable details
  - Styled with DaisyUI components
- [ ] 4.6 Add footer
  - Site information
  - Links to tools and support
  - Social media links (placeholders)
- [ ] 4.7 Integrate analog clock option
  - Add toggle or view switcher for digital/analog clock
  - Display analog clock when selected
  - Support multiple analog clocks in grid layout
- [ ] 4.8 Implement city selection functionality
  - Add link/button to city selection page
  - Load selected cities from IndexedDB preferences
  - Display only selected cities on home page
  - Show default cities if no selection made

## 4a. City Selection Page

- [ ] 4a.1 Create city selection page (`src/routes/[lang]/select-cities/+page.svelte`)
  - Display list of all available cities
  - Checkbox or toggle for each city
  - Search/filter functionality
  - Drag-and-drop reordering support
- [ ] 4a.2 Implement city selection logic
  - Save selected cities to IndexedDB
  - Save city order/sequence
  - Load saved preferences on page load
- [ ] 4a.3 Add city selection UI
  - Clean, intuitive interface
  - Visual feedback for selected cities
  - "Select All" / "Deselect All" buttons
  - Save and cancel buttons

## 4b. Widget Functionality

- [ ] 4b.1 Create widget creation page (`src/routes/[lang]/widget/+page.svelte`)
  - City selection interface for widget
  - Display format selection (digital/analog)
  - Layout customization options
  - Preview of widget appearance
- [ ] 4b.2 Implement widget configuration
  - Save widget configuration to IndexedDB
  - Generate shareable URL with widget parameters
  - Generate embed code (iframe or script)
- [ ] 4b.3 Create widget display route (`src/routes/[lang]/widget/[id]/+page.svelte`)
  - Load widget configuration from URL parameters or ID
  - Display widget with selected cities
  - Clean, minimal design for public displays
  - Fullscreen mode support
  - Auto-refresh functionality
- [ ] 4b.4 Optimize widget for hotel/public displays
  - Large, readable fonts
  - High contrast colors
  - Minimal branding
  - Responsive grid layout
  - Support for multiple screen sizes

## 5. Internationalization

- [ ] 5.1 Add home page translations to `messages/en.json`
  - Page title, meta description
  - All UI labels, buttons, text
  - FAQ questions and answers
  - City names and timezone labels
  - Time format labels (12-hour, 24-hour, AM, PM)
  - Widget-related text
- [ ] 5.2 Add home page translations to `messages/th.json`
  - Complete translation of all English content
- [ ] 5.3 Add home page translations to `messages/es.json`
  - Complete translation of all English content
- [ ] 5.4 Integrate Paraglide translations in home page component
  - Use `$t()` function for all translatable text
  - Ensure date/time formatting respects locale
- [ ] 5.5 Add translations for city selection page
  - All UI text for city selector
  - Button labels and instructions
- [ ] 5.6 Add translations for widget pages
  - Widget creation interface text
  - Widget display labels

## 6. SEO & Metadata

- [ ] 6.1 Add SEO meta tags to home page
  - Unique title (50-60 characters)
  - Meta description (150-160 characters)
  - Open Graph tags
  - Twitter Card tags
- [ ] 6.2 Add structured data (JSON-LD)
  - Time information schema
  - Organization schema
  - Breadcrumb schema
- [ ] 6.3 Add hreflang tags for multi-language support
  - Link to all language variants of home page

## 7. Styling & Responsiveness

- [ ] 7.1 Apply DaisyUI components throughout
  - Use DaisyUI card, button, input components
  - Ensure consistent theme and styling
- [ ] 7.2 Ensure full responsiveness
  - Mobile-first approach
  - Test on mobile, tablet, desktop viewports
  - Adjust grid layouts for different screen sizes
- [ ] 7.3 Add dark mode support
  - Use DaisyUI dark mode classes
  - Ensure all components work in dark mode

## 8. Testing & Validation

- [ ] 8.1 Test time calculations
  - Verify UTC time accuracy
  - Test timezone conversions
  - Verify Unix timestamp calculations
  - Test Julian date calculations
- [ ] 8.2 Test IndexedDB functionality
  - Verify data storage and retrieval
  - Test cache invalidation
- [ ] 8.3 Test i18n functionality
  - Verify all translations load correctly
  - Test language switching
  - Verify date/time formatting per locale
- [ ] 8.4 Test copy-to-clipboard functionality
  - Verify clipboard API works
  - Test fallback for older browsers
- [ ] 8.5 Test search functionality
  - Verify city/timezone filtering works
  - Test with various search queries
- [ ] 8.6 Test time format selection
  - Verify 12-hour format displays correctly with AM/PM
  - Verify 24-hour format displays correctly
  - Test format preference persistence in IndexedDB
  - Verify format applies to all time displays
- [ ] 8.7 Test city selection functionality
  - Verify city selection saves to IndexedDB
  - Test city reordering
  - Verify only selected cities display on home page
  - Test default cities when no selection made
- [ ] 8.8 Test analog clock display
  - Verify clock hands move smoothly
  - Test clock accuracy
  - Verify multiple clocks display correctly
  - Test clock in different timezones
- [ ] 8.9 Test widget functionality
  - Verify widget configuration saves correctly
  - Test widget URL generation
  - Verify widget displays selected cities
  - Test widget in fullscreen mode
  - Verify widget auto-refresh works
  - Test widget on large displays (simulate TV/monitor)
- [ ] 8.10 Validate SEO elements
  - Check meta tags are present
  - Validate JSON-LD structured data
  - Verify hreflang tags

## 9. Performance Optimization

- [ ] 9.1 Optimize clock update intervals
  - Use efficient timer management
  - Clean up intervals on component unmount
- [ ] 9.2 Optimize JSON database loading
  - Lazy load timezone data
  - Cache in IndexedDB after first load
- [ ] 9.3 Optimize component rendering
  - Use Svelte 5 runes efficiently
  - Minimize unnecessary re-renders
- [ ] 9.4 Test page load performance
  - Ensure page loads in < 2 seconds
  - Optimize bundle size
- [ ] 9.5 Optimize analog clock rendering
  - Ensure smooth animations without jank
  - Optimize SVG rendering performance
  - Test with multiple clocks displayed
- [ ] 9.6 Optimize widget performance
  - Ensure widget loads quickly
  - Optimize for large displays
  - Minimize resource usage for public displays
