# Design: Timezone Meeting Converter

## Context

The meeting converter page needs to store user-selected cities independently from the home page. The home page currently stores city preferences in IndexedDB using the `USER_PREFERENCES` store with key `'default'`. Multiple pages may need to store different city lists for different purposes, so we need a scalable storage structure.

## Goals / Non-Goals

### Goals
- Store meeting converter city list separately from home page preferences
- Allow users to input time in UTC or for a specific city
- Display converted times for multiple cities simultaneously
- Persist city selections across page reloads
- Support adding/removing cities from the display list
- Maintain clean separation between different page preferences

### Non-Goals
- Real-time clock updates (this is a converter, not a live clock)
- Widget functionality (separate feature)
- Sharing or exporting meeting times (future enhancement)

## Decisions

### Decision: IndexedDB Storage Structure

**Approach**: Extend the existing `USER_PREFERENCES` object store with page-specific keys.

**Rationale**:
- The existing `USER_PREFERENCES` store already handles user preferences
- Using different keys (e.g., `'default'` for home page, `'meeting-converter'` for converter page) provides clean separation
- No need for database schema migration
- Consistent with existing patterns

**Alternative Considered**: Create a new object store `MEETING_CONVERTER_PREFERENCES`
- **Rejected because**: Adds unnecessary complexity and database versioning overhead
- The existing store can handle multiple preference types with different keys

### Decision: Data Structure

**Meeting Converter Preferences**:
```typescript
interface MeetingConverterPreferences {
  selectedCities: string[]; // Array of city IDs
  cityOrder?: string[]; // Optional ordering
  lastInputTime?: {
    type: 'utc' | 'city';
    time: string; // ISO 8601 string
    cityId?: string; // If type is 'city'
  };
}
```

**Storage Key**: `'meeting-converter'` in the `USER_PREFERENCES` store

**Rationale**:
- Simple structure focused on city list and optional time input persistence
- Reuses existing city ID system
- Optional time persistence allows restoring last input on page reload

### Decision: Time Input Interface

**Approach**: Two input modes:
1. **UTC Mode**: Date + time picker, automatically converts to all selected cities
2. **City Mode**: Date + time picker + city selector, converts that city's time to UTC first, then to all other cities

**Rationale**:
- Covers both common use cases (scheduling from UTC or from a known city)
- Clear separation of input modes
- Intuitive for users

### Decision: Component Reuse

**Reuse**:
- `CityCard` component (with modifications for static time display)
- `SearchInput` component
- `TimeFormatSelector` component
- `AddCityCard` component

**New Components**:
- `TimeInput` - For date/time input with mode selection
- `MeetingCityList` - Display list of cities with converted times

**Rationale**:
- Leverage existing components where possible
- Create new components only when behavior differs significantly

## Risks / Trade-offs

### Risk: IndexedDB Key Conflicts
- **Mitigation**: Use descriptive, unique keys (`'meeting-converter'` vs `'default'`)
- **Monitoring**: Document key usage in code comments

### Risk: Time Conversion Accuracy
- **Mitigation**: Use native JavaScript `Intl` API and existing timezone utilities
- **Testing**: Test edge cases (DST transitions, timezone boundaries)

### Risk: Performance with Many Cities
- **Mitigation**: Limit initial display, implement pagination or "show more" if needed
- **Monitoring**: Profile with 20+ cities selected

## Migration Plan

### No Migration Required
- New feature, no existing data to migrate
- Uses existing IndexedDB structure with new keys
- Backward compatible with home page preferences

## Open Questions

- Should we persist the last input time? (Decided: Optional, stored but not required)
- Should there be a limit on number of cities? (Decided: No hard limit initially, monitor performance)
- Should we support time ranges (e.g., "9 AM - 5 PM in New York")? (Future enhancement)
