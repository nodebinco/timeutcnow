## ADDED Requirements

### Requirement: Home Page UTC Time Display
The system SHALL display the current UTC time in a large, prominent format on the home page.

#### Scenario: UTC time display updates in real-time
- **WHEN** the home page is loaded
- **THEN** the current UTC time is displayed in format HH:MM:SS
- **AND** the time updates every 100ms for smooth visual perception
- **AND** the date is displayed below the time in a readable format

#### Scenario: UTC time format display
- **WHEN** UTC time is displayed
- **THEN** hours and minutes are shown in 2-digit format (00-23)
- **AND** seconds are highlighted with a distinct color
- **AND** a "Live UTC Time" indicator badge is shown

#### Scenario: Time format selection
- **WHEN** a user selects time format preference
- **THEN** the system provides options for 12-hour (AM/PM) or 24-hour format
- **AND** the selected format is applied to all time displays on the page
- **AND** the preference is saved in IndexedDB for future visits
- **AND** the format can be changed via a settings button or dropdown

### Requirement: Time Information Cards
The system SHALL display additional time-related information in card format.

#### Scenario: Local time card display
- **WHEN** the home page is loaded
- **THEN** a card displays the user's local time
- **AND** the card shows the UTC offset (e.g., "UTC +5")
- **AND** the card displays the user's timezone name

#### Scenario: Unix timestamp card display
- **WHEN** the home page is loaded
- **THEN** a card displays the current Unix timestamp (seconds since Jan 1, 1970)
- **AND** the card includes a copy button
- **AND** clicking the copy button copies the timestamp to clipboard

#### Scenario: Julian date card display
- **WHEN** the home page is loaded
- **THEN** a card displays the current Julian date
- **AND** the card includes an info icon with tooltip explaining Julian date

### Requirement: Major Cities Time Display
The system SHALL display the current time for major cities around the world.

#### Scenario: City time cards display
- **WHEN** the home page is loaded
- **THEN** a grid of city cards is displayed showing major cities
- **AND** each card shows the city name, timezone label, and current local time
- **AND** each card displays a day/night indicator (sunrise icon for day, moon icon for night)
- **AND** the time is formatted as HH:MM in 24-hour format

#### Scenario: City search functionality
- **WHEN** a user types in the search input
- **THEN** the city cards are filtered to show only matching cities
- **AND** the search matches city names and timezone labels
- **AND** the search is case-insensitive

#### Scenario: City selection and customization
- **WHEN** a user accesses the city selection page or section
- **THEN** a list of available cities is displayed with checkboxes or toggle buttons
- **AND** users can select/deselect cities to display on the home page
- **AND** selected cities are saved in IndexedDB as user preferences
- **AND** the home page displays only the selected cities
- **AND** users can reorder cities by drag-and-drop or up/down buttons

### Requirement: JSON Database for Timezone Data
The system SHALL store timezone-related data in structured JSON files.

#### Scenario: Cities database structure
- **WHEN** the application loads timezone data
- **THEN** city data is loaded from `src/lib/data/cities.json`
- **AND** each city entry includes: id, name, country code, IANA timezone, label, and coordinates
- **AND** the data structure is type-safe with TypeScript interfaces

#### Scenario: Countries database structure
- **WHEN** the application loads country data
- **THEN** country data is loaded from `src/lib/data/countries.json`
- **AND** each country entry includes: code, name, and primary timezone
- **AND** the data structure is type-safe with TypeScript interfaces

#### Scenario: Timezones database structure
- **WHEN** the application loads timezone data
- **THEN** timezone data is loaded from `src/lib/data/timezones.json`
- **AND** each timezone entry includes: IANA name, abbreviation, UTC offset, DST offset, and DST rules
- **AND** the data structure is type-safe with TypeScript interfaces

### Requirement: IndexedDB Caching
The system SHALL cache JSON database data in IndexedDB for improved performance.

#### Scenario: Initial data loading and caching
- **WHEN** the application loads for the first time
- **THEN** JSON database files are loaded from the file system
- **AND** the data is stored in IndexedDB with a version/timestamp
- **AND** subsequent loads check IndexedDB cache first

#### Scenario: Cache retrieval
- **WHEN** the application loads on subsequent visits
- **THEN** data is retrieved from IndexedDB cache if available and valid
- **AND** if cache is invalid or missing, data is loaded from JSON files
- **AND** the cache is updated after loading from files

### Requirement: Copy to Clipboard Functionality
The system SHALL provide copy-to-clipboard functionality for UTC timestamps.

#### Scenario: Copy ISO 8601 timestamp
- **WHEN** a user clicks the "Copy ISO 8601" button
- **THEN** the current UTC time in ISO 8601 format is copied to clipboard
- **AND** a success notification is displayed
- **AND** the notification disappears after 2 seconds

#### Scenario: Copy Unix timestamp
- **WHEN** a user clicks the copy button on the Unix timestamp card
- **THEN** the Unix timestamp value is copied to clipboard
- **AND** a success notification is displayed

### Requirement: Educational Content Section
The system SHALL display educational content about UTC time.

#### Scenario: UTC information section
- **WHEN** the home page is loaded
- **THEN** a section titled "What is UTC?" is displayed
- **AND** the section includes explanatory text about UTC
- **AND** the section includes a list of UTC characteristics (no DST, standard for aviation, etc.)

#### Scenario: FAQ section
- **WHEN** the home page is loaded
- **THEN** a FAQ section is displayed with common questions about UTC
- **AND** each FAQ item is expandable/collapsible
- **AND** clicking a question expands to show the answer

### Requirement: Internationalization Support
The system SHALL support multiple languages for all home page content.

#### Scenario: Translated content display
- **WHEN** a user visits the home page in a supported language
- **THEN** all text content is displayed in that language
- **AND** date/time formatting respects the locale
- **AND** translations are loaded using Paraglide

#### Scenario: Language-specific URLs
- **WHEN** a user visits the home page
- **THEN** the URL structure supports language prefixes (e.g., `/en/`, `/th/`)
- **AND** the default language (English) can be accessed without prefix

### Requirement: SEO Optimization
The system SHALL include SEO-optimized meta tags and structured data.

#### Scenario: Meta tags presence
- **WHEN** the home page is loaded
- **THEN** a unique meta title (50-60 characters) is present
- **AND** a unique meta description (150-160 characters) is present
- **AND** Open Graph tags are present for social sharing
- **AND** Twitter Card tags are present

#### Scenario: Structured data (JSON-LD)
- **WHEN** the home page is loaded
- **THEN** JSON-LD structured data is included in the page
- **AND** the structured data includes time information schema
- **AND** the structured data is valid according to schema.org

#### Scenario: Hreflang tags
- **WHEN** the home page is loaded
- **THEN** hreflang tags are present linking to all language variants
- **AND** the tags help search engines understand language relationships

### Requirement: Responsive Design
The system SHALL display correctly on all device sizes.

#### Scenario: Mobile display
- **WHEN** the home page is viewed on a mobile device
- **THEN** all content is readable and accessible
- **AND** the UTC clock is appropriately sized for mobile screens
- **AND** the city cards grid adapts to single column layout

#### Scenario: Desktop display
- **WHEN** the home page is viewed on a desktop device
- **THEN** content is displayed in a multi-column layout
- **AND** the UTC clock is prominently displayed
- **AND** the city cards grid displays multiple columns

### Requirement: Dark Mode Support
The system SHALL support dark mode display.

#### Scenario: Dark mode styling
- **WHEN** dark mode is enabled
- **THEN** all components display with appropriate dark mode colors
- **AND** text remains readable
- **AND** contrast ratios meet WCAG AA standards

### Requirement: Analog Clock Display
The system SHALL provide a beautiful round analog clock display option.

#### Scenario: Analog clock view
- **WHEN** a user selects analog clock view
- **THEN** a round analog clock is displayed with hour, minute, and second hands
- **AND** the clock shows the current UTC time or selected city time
- **AND** the clock has a clean, modern design suitable for hotel/public displays
- **AND** the clock updates smoothly in real-time
- **AND** the clock can be displayed alongside or instead of digital time

#### Scenario: Analog clock for multiple cities
- **WHEN** analog clock view is enabled
- **THEN** multiple analog clocks can be displayed in a grid layout
- **AND** each clock shows a different city's time
- **AND** each clock is labeled with the city name
- **AND** the layout is clean and suitable for widget embedding

### Requirement: Widget Functionality
The system SHALL support widget embedding for multiple cities, suitable for hotel/public displays.

#### Scenario: Widget creation and configuration
- **WHEN** a user accesses the widget creation page
- **THEN** users can select multiple cities to display in the widget
- **AND** users can choose between digital and analog clock displays
- **AND** users can customize widget appearance (size, colors, layout)
- **AND** a widget embed code or URL is generated

#### Scenario: Widget display
- **WHEN** a widget is embedded or accessed via URL
- **THEN** the widget displays selected cities with their current times
- **AND** the widget has a clean, minimal design suitable for public displays
- **AND** the widget updates in real-time
- **AND** the widget is responsive and works on various screen sizes
- **AND** the widget can be displayed in fullscreen or embedded mode

#### Scenario: Widget for hotel use case
- **WHEN** a widget is configured for hotel/public display
- **THEN** the widget displays multiple cities in a clean grid layout
- **AND** the widget has minimal branding and distractions
- **AND** the widget is optimized for large displays (TVs, monitors)
- **AND** the widget automatically refreshes to stay current
