## ADDED Requirements

### Requirement: Complete Translation Coverage
The system SHALL provide translations for all user-facing text in all supported languages.

#### Scenario: All keys present in all languages
- **WHEN** a user accesses any page in any supported language
- **THEN** all translation keys used by that page are present in the language file
- **AND** no "undefined" text is displayed to the user
- **AND** all user-facing strings are properly translated

#### Scenario: Translation key validation
- **WHEN** new translation keys are added to the English file
- **THEN** those keys must be added to all other supported language files
- **AND** a validation process ensures no keys are missing
- **AND** missing keys are identified before deployment

### Requirement: No Hardcoded Strings
The system SHALL use translation keys for all user-facing text instead of hardcoded strings.

#### Scenario: All text uses translation keys
- **WHEN** code is reviewed or updated
- **THEN** no hardcoded English strings appear in components or pages
- **AND** all user-facing text uses Paraglide translation functions
- **AND** labels, buttons, and messages are all translatable

#### Scenario: Hardcoded string detection
- **WHEN** a developer adds new UI text
- **THEN** the text must use a translation key instead of a hardcoded string
- **AND** code review process checks for hardcoded strings
- **AND** linting or validation tools flag hardcoded strings

### Requirement: Translation Key Naming Convention
The system SHALL follow consistent naming conventions for translation keys.

#### Scenario: Consistent key naming
- **WHEN** translation keys are created
- **THEN** keys follow a consistent pattern (e.g., `page_component_element`)
- **AND** keys are descriptive and indicate their usage context
- **AND** similar keys are grouped logically (e.g., all `converter_*` keys together)

#### Scenario: Key organization
- **WHEN** translation files are structured
- **THEN** keys are organized by feature or page
- **AND** related keys are grouped together
- **AND** the structure makes it easy to find and maintain translations

## MODIFIED Requirements

### Requirement: Internationalization Support
The system SHALL support multiple languages for all page content.

#### Scenario: Translated content display
- **WHEN** a user visits any page in a supported language
- **THEN** all text content is displayed in that language
- **AND** date/time formatting respects the locale
- **AND** translations are loaded using Paraglide
- **AND** no translation keys are missing (no "undefined" text appears)

#### Scenario: Complete translation coverage
- **WHEN** a new feature or page is added
- **THEN** all translation keys for that feature are added to all supported language files
- **AND** a validation process ensures completeness
- **AND** missing translations are caught before deployment
