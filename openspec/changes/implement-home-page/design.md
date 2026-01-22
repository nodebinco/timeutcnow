# Design: Home Page Implementation with JSON Database

## Context

The home page needs to display real-time UTC time and showcase major cities' times. To ensure scalability and maintainability, all timezone-related data (cities, countries, timezone information) must be stored in structured JSON files that can be easily extended, versioned, and managed. The application must support multiple languages and provide excellent SEO.

## Goals / Non-Goals

### Goals
- Create a scalable JSON database structure for timezone data
- Implement real-time UTC time display with smooth updates
- Build reusable components following SvelteKit and DaisyUI patterns
- Support full internationalization with Paraglide
- Optimize for SEO with proper meta tags and structured data
- Use IndexedDB for client-side caching (following project conventions)
- Ensure responsive design across all devices

### Non-Goals
- Building a full timezone converter (separate page)
- Implementing user accounts or authentication (preferences stored locally)
- Creating a timezone map visualization (future work)
- Building a backend API endpoint (future work)

## Decisions

### Decision: JSON Database Structure

**What**: Store timezone data in structured JSON files under `src/lib/data/`

**Why**: 
- JSON is human-readable and easy to maintain
- Can be version-controlled and easily extended
- No database setup required for static data
- Can be loaded at build time or runtime
- Supports tree-shaking and code splitting

**Structure**:
```
src/lib/data/
├── cities.json          # Array of city objects
├── countries.json       # Array of country objects
└── timezones.json       # Array of timezone objects
```

**Example City Entry**:
```json
{
  "id": "london",
  "name": "London",
  "country": "GB",
  "timezone": "Europe/London",
  "label": "BST/GMT",
  "coordinates": { "lat": 51.5074, "lng": -0.1278 }
}
```

**Example Timezone Entry**:
```json
{
  "iana": "America/New_York",
  "abbreviation": "EST/EDT",
  "utcOffset": -5,
  "dstOffset": -4,
  "dstStart": "second-sunday-march",
  "dstEnd": "first-sunday-november"
}
```

**Alternatives considered**:
- SQLite database: Too heavy for static data, requires build-time processing
- API endpoint: Adds latency, requires backend infrastructure
- Hardcoded arrays: Not scalable, harder to maintain

### Decision: IndexedDB for Caching

**What**: Use IndexedDB to cache JSON database data on the client

**Why**:
- Project convention requires IndexedDB (not localStorage)
- Better performance for larger datasets
- Asynchronous operations don't block UI
- Larger storage limits than localStorage
- Structured data storage

**Implementation**:
- Load JSON files on first page load
- Store in IndexedDB with version/timestamp
- Check cache before loading from files
- Invalidate cache when data structure changes

**Alternatives considered**:
- localStorage: Project explicitly forbids this
- No caching: Would reload data on every page visit
- Service Worker cache: More complex, IndexedDB is sufficient

### Decision: Component Architecture

**What**: Create small, focused, reusable components

**Why**:
- Follows SvelteKit best practices
- Enables code reuse across pages
- Easier to test and maintain
- Better performance through component isolation

**Component Structure**:
```
src/lib/components/
├── utc-clock.svelte          # Main UTC time display
├── analog-clock.svelte        # Round analog clock display
├── info-card.svelte           # Reusable info card
├── city-card.svelte           # City time display card
├── city-selector.svelte       # City selection interface
├── time-format-selector.svelte # 12/24 hour format selector
├── widget-display.svelte      # Widget view for multiple cities
└── search-input.svelte        # Search input with icon
```

**Alternatives considered**:
- Monolithic component: Harder to maintain and test
- Too many small components: Over-engineering, chose balanced approach

### Decision: Real-time Updates (100ms intervals)

**What**: Update clock display every 100ms for smooth perception

**Why**:
- Provides smooth visual updates
- 100ms is sufficient for human perception
- Balances performance with smoothness
- More frequent than 1 second updates

**Implementation**:
- Use `setInterval` with 100ms
- Clean up on component unmount
- Use Svelte 5 `$effect` for lifecycle management

**Alternatives considered**:
- 1 second intervals: Less smooth, noticeable jumps
- RequestAnimationFrame: More complex, 100ms is sufficient
- 50ms intervals: Unnecessary, minimal visual improvement

### Decision: Timezone Data Loading Strategy

**What**: Load JSON data at build time, cache in IndexedDB at runtime

**Why**:
- Build-time loading enables tree-shaking
- Runtime caching improves performance
- No API calls needed for static data
- Can be extended to API later if needed

**Implementation**:
- Import JSON files directly in TypeScript
- Type-safe with TypeScript interfaces
- Cache in IndexedDB on first load
- Check cache before loading from files

**Alternatives considered**:
- Runtime fetch: Adds latency, requires error handling
- Build-time only: No caching benefits
- API endpoint: Overkill for static data

## Risks / Trade-offs

### Risk: JSON File Size Growth
**Mitigation**: 
- Use tree-shaking to only include used data
- Consider lazy loading for large datasets
- Monitor bundle size during development

### Risk: IndexedDB Complexity
**Mitigation**:
- Create utility functions to abstract complexity
- Handle errors gracefully with fallbacks
- Test across different browsers

### Risk: Timezone Accuracy
**Mitigation**:
- Use IANA timezone names (standard)
- Rely on browser's `Intl` API for conversions
- Test with known timezone edge cases (DST transitions)

### Trade-off: Real-time Updates vs Performance
**Decision**: 100ms intervals provide good balance
- Smooth enough for user experience
- Not too frequent to impact performance
- Can be adjusted if needed

## Migration Plan

### Initial Implementation
1. Create JSON database files with initial data
2. Implement TypeScript types
3. Build utility functions
4. Create components
5. Assemble home page
6. Add i18n translations
7. Add SEO elements

### Future Extensions
- Add more cities to JSON database (simple file edit)
- Extend timezone data with DST rules
- Add country-specific timezone information
- Consider API endpoint for dynamic data updates

### Decision: Time Format Selection

**What**: Allow users to choose between 12-hour (AM/PM) and 24-hour time formats

**Why**:
- Different users have different preferences
- Some regions prefer 12-hour format, others prefer 24-hour
- Hotel/public displays may need specific formats
- Improves user experience and accessibility

**Implementation**:
- Add time format selector in settings or header
- Store preference in IndexedDB
- Apply format to all time displays (UTC clock, city cards, etc.)
- Default to 24-hour format for international consistency

**Alternatives considered**:
- Always 24-hour: Less flexible, may confuse some users
- Always 12-hour: Not standard for international/time applications
- Auto-detect from locale: May not match user preference

### Decision: City Selection and Customization

**What**: Provide a page/section for users to select which cities to display

**Why**:
- Users may only care about specific cities
- Hotel/public displays need customizable city lists
- Reduces clutter on the home page
- Enables personalized experience

**Implementation**:
- Create city selection page or modal
- Store selected cities in IndexedDB
- Allow drag-and-drop reordering
- Support search/filter in city selector
- Default to major cities if no selection made

**Alternatives considered**:
- Fixed city list: Less flexible, not suitable for all use cases
- Server-side preferences: Requires backend, local storage is sufficient

### Decision: Analog Clock Display

**What**: Create a beautiful round analog clock component

**Why**:
- Provides visual variety and aesthetic appeal
- Hotel/public displays often prefer analog clocks
- More intuitive for some users
- Creates a professional, clean appearance

**Implementation**:
- SVG-based analog clock with hour, minute, second hands
- Smooth animations using CSS transforms
- Support for multiple clocks in grid layout
- Clean, minimal design suitable for public displays
- Option to display alongside or instead of digital time

**Alternatives considered**:
- Canvas-based: More complex, SVG is easier to style
- Image-based: Not scalable, requires many assets
- Third-party library: Adds dependency, custom is better

### Decision: Widget Functionality

**What**: Support widget embedding for multiple cities, optimized for hotel/public displays

**Why**:
- Hotels need clean, multi-city displays
- Public displays require minimal branding
- Widgets can be embedded in other websites
- Enables use case for businesses and organizations

**Implementation**:
- Create widget configuration page
- Generate embed code or shareable URL
- Support fullscreen mode for public displays
- Minimal branding, clean design
- Optimize for large screens (TVs, monitors)
- Auto-refresh to stay current

**Widget Features**:
- Select multiple cities
- Choose digital or analog display
- Customize layout (grid, list)
- Set size and color scheme
- Generate embed URL with parameters

**Alternatives considered**:
- Separate widget application: More complex, single app is better
- No widget support: Misses hotel/public display use case

## Open Questions

- Should we add timezone map visualization? (Future work)
- Should we create an API for timezone data? (Future work, if needed)
- Should widgets support authentication/private sharing? (Future work)
