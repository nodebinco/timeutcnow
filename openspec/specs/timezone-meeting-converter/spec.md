# timezone-meeting-converter Specification

## Purpose
TBD - created by archiving change add-timezone-meeting-converter. Update Purpose after archive.
## Requirements
### Requirement: Time Input Interface
The system SHALL provide an interface for users to input a specific time for conversion.

#### Scenario: UTC time input
- **WHEN** a user selects UTC input mode
- **THEN** a date picker and time picker are displayed
- **AND** the user can enter a date and time in UTC
- **AND** upon input, the system converts this UTC time to all selected cities

#### Scenario: City time input
- **WHEN** a user selects city input mode
- **THEN** a date picker, time picker, and city selector are displayed
- **AND** the user can enter a date and time for a specific city
- **AND** upon input, the system converts this city's time to UTC first
- **AND** then converts the UTC time to all other selected cities

#### Scenario: Input mode switching
- **WHEN** a user switches between UTC and city input modes
- **THEN** the appropriate input fields are shown or hidden
- **AND** the city selector appears only in city mode
- **AND** the conversion updates based on the current input

### Requirement: City Selection for Meeting Converter
The system SHALL allow users to select and manage a list of cities to display converted times.

#### Scenario: Adding cities to converter list
- **WHEN** a user searches for and selects a city from the available cities
- **THEN** the city is added to the meeting converter city list
- **AND** the city appears in the converted times display
- **AND** the selection is saved to IndexedDB with key `'meeting-converter'`

#### Scenario: Removing cities from converter list
- **WHEN** a user removes a city from the meeting converter list
- **THEN** the city is removed from the display
- **AND** the updated list is saved to IndexedDB
- **AND** the city becomes available for selection again

#### Scenario: City list persistence
- **WHEN** a user reloads the meeting converter page
- **THEN** the previously selected cities are loaded from IndexedDB
- **AND** the city list is restored
- **AND** the list is independent from the home page's city preferences

### Requirement: Time Conversion Display
The system SHALL display the converted time for each selected city.

#### Scenario: Display converted times
- **WHEN** a user inputs a time (UTC or city time)
- **THEN** for each selected city, the system displays:
  - The date in that city's local timezone
  - The time in that city's local timezone
  - The UTC offset for that city
  - A day/night indicator (sunrise icon for day, moon icon for night)
- **AND** the time format (12-hour or 24-hour) matches the user's preference

#### Scenario: Time format selection
- **WHEN** a user changes the time format preference
- **THEN** all displayed times update to the selected format
- **AND** the preference is saved to IndexedDB
- **AND** the preference is shared with other pages (if applicable)

#### Scenario: Copy city time
- **WHEN** a user clicks the copy button for a city's time
- **THEN** the formatted time string is copied to the clipboard
- **AND** a success notification is displayed
- **AND** the copied text includes date, time, and timezone information

### Requirement: IndexedDB Storage for Meeting Converter
The system SHALL store meeting converter preferences separately from home page preferences.

#### Scenario: Separate storage keys
- **WHEN** the system saves meeting converter city preferences
- **THEN** the data is stored in the `USER_PREFERENCES` object store
- **AND** the key used is `'meeting-converter'` (distinct from `'default'` used by home page)
- **AND** the home page preferences remain unaffected

#### Scenario: Loading meeting converter preferences
- **WHEN** the meeting converter page loads
- **THEN** the system retrieves preferences using key `'meeting-converter'`
- **AND** if no preferences exist, an empty city list is used
- **AND** the home page preferences are not accessed or modified

#### Scenario: Data structure
- **WHEN** preferences are saved
- **THEN** the stored data includes:
  - `selectedCities`: array of city IDs
  - `cityOrder`: optional array for custom ordering
  - `lastInputTime`: optional object with last input time and mode
- **AND** the data structure is type-safe with TypeScript interfaces

### Requirement: Meeting Converter Page Route
The system SHALL provide a dedicated route for the meeting converter page.

#### Scenario: Route accessibility
- **WHEN** a user navigates to `/[locale]/meeting-converter`
- **THEN** the meeting converter page is displayed
- **AND** the page is accessible in all supported locales
- **AND** the default locale (English) is accessible at `/meeting-converter`

#### Scenario: Page structure
- **WHEN** the page loads
- **THEN** it displays:
  - A page title and description
  - Time input interface
  - City selection interface
  - Converted times display
  - Navigation and footer consistent with site design

### Requirement: Internationalization
The system SHALL support multiple languages for the meeting converter page.

#### Scenario: Translated content
- **WHEN** a user accesses the page in a supported language
- **THEN** all user-facing text is displayed in that language
- **AND** date and time formats follow locale conventions
- **AND** translations are provided via Paraglide

#### Scenario: Locale routing
- **WHEN** a user navigates to the meeting converter
- **THEN** the URL includes the locale parameter (e.g., `/en/meeting-converter`, `/th/meeting-converter`)
- **AND** the page content matches the selected locale

### Requirement: SEO Optimization
The system SHALL provide SEO-optimized content for the meeting converter page.

#### Scenario: Meta tags
- **WHEN** the page is loaded
- **THEN** unique meta title and description are set
- **AND** the title includes relevant keywords
- **AND** the description is 150-160 characters

#### Scenario: Structured content
- **WHEN** the page is rendered
- **THEN** it includes:
  - A unique H1 heading
  - Proper heading hierarchy (H2, H3)
  - Descriptive content explaining the tool's purpose
  - Structured data (JSON-LD) if applicable

