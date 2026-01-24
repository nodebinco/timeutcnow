# Change: Fix i18n Missing Translations

## Why
The time zone converter page and other pages are displaying "undefined" text in multiple languages because translation keys are missing from all non-English language files. Currently, 42 translation keys are missing across all 16 supported languages (ar, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, th, tr, vi, zh). Additionally, there are hardcoded English strings ("Date:" and "Time:") in the time-zone-converter page that should use translation keys instead.

This breaks the user experience for non-English users, showing "undefined" instead of translated text, which makes the application appear broken or incomplete.

## What Changes
- **ADDED**: All missing translation keys will be added to all 16 language files
- **MODIFIED**: Hardcoded strings "Date:" and "Time:" in time-zone-converter page will be replaced with translation keys
- **ADDED**: New translation keys for the hardcoded strings:
  - `converter_date_label` - For "Date:" label
  - `converter_time_label` - For "Time:" label
- **MODIFIED**: All 42 missing keys will be translated and added to all language files:
  - `converter_converted_times`
  - `converter_showing_time`
  - `converter_showing_time_singular`
  - `converter_showing_time_plural`
  - `converter_displaying_first`
  - `converter_select_date_time`
  - `converter_show_less`
  - `converter_show_all`
  - `converter_enter_date_time`
  - `converter_no_cities_selected`
  - `converter_search_placeholder`
  - `converter_view_all_cities`
  - `converter_showing_count`
  - `converter_results`
  - `converter_available_cities`
  - `converter_selected_time`
  - `converter_current_time`
  - `converter_timezone`
  - `converter_remove_city`
  - `converter_benefit_free_title`
  - `converter_benefit_free_text`
  - `converter_benefit_accurate_title`
  - `converter_benefit_accurate_text`
  - `converter_benefit_easy_title`
  - `converter_benefit_easy_text`
  - `converter_benefit_customizable_title`
  - `converter_benefit_customizable_text`
  - `converter_benefit_offline_title`
  - `converter_benefit_offline_text`
  - `converter_utc_feature_1` through `converter_utc_feature_6`
  - `converter_your_local_timezone`
  - `converter_showing_of_available`
  - `utc_feature_1` through `utc_feature_6`

## Impact
- **Affected specs**: `i18n` (new capability)
- **Affected code**: 
  - `messages/*.json` - All 16 language files (ar, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, th, tr, vi, zh)
  - `src/routes/[locale]/time-zone-converter/+page.svelte` - Replace hardcoded strings with translation keys
- **User impact**: All non-English users will see properly translated content instead of "undefined" text
- **Languages affected**: All 16 supported languages
