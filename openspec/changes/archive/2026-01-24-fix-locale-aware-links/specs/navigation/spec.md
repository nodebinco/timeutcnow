## ADDED Requirements
### Requirement: Locale-Aware Navigation Links
The system SHALL generate all internal navigation links using the current locale, ensuring that links maintain the user's selected language preference.

#### Scenario: Navigation links respect current locale
- **WHEN** a user has selected a non-default locale (e.g., Thai)
- **AND** the user clicks any internal navigation link (navbar, sidebar, footer, or in-content)
- **THEN** the link URL includes the current locale prefix (e.g., `/th/about` instead of `/en/about`)
- **AND** the user remains in their selected language after navigation

#### Scenario: Footer links are locale-aware
- **WHEN** a user is viewing a page in a specific locale (e.g., `/th/`)
- **AND** the user clicks a footer link (Tools, Support sections)
- **THEN** the footer link URL includes the current locale prefix
- **AND** the destination page loads in the same locale

#### Scenario: Mobile sidebar links are locale-aware
- **WHEN** a user opens the mobile sidebar menu in a specific locale
- **AND** the user clicks a navigation link from the sidebar
- **THEN** the link URL includes the current locale prefix
- **AND** the destination page loads in the same locale

#### Scenario: Desktop navbar links are locale-aware
- **WHEN** a user views the desktop navigation bar in a specific locale
- **AND** the user clicks a navigation link from the navbar
- **THEN** the link URL includes the current locale prefix
- **AND** the destination page loads in the same locale

#### Scenario: In-content links are locale-aware
- **WHEN** a user is viewing page content in a specific locale
- **AND** the page contains internal links to other pages
- **THEN** those links include the current locale prefix
- **AND** clicking them navigates to the destination in the same locale

#### Scenario: Links use localizeHref function
- **WHEN** internal navigation links are generated
- **THEN** the `localizeHref()` function from `$lib/paraglide/runtime` is used
- **AND** the function automatically detects the current locale via `getLocale()`
- **AND** links are generated relative to the current locale without hardcoding locale values
