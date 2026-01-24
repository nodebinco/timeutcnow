## 1. Implementation
- [x] 1.1 Update home page (`src/routes/[locale]/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.2 Update about page (`src/routes/[locale]/about/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.3 Update contact page (`src/routes/[locale]/contact/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.4 Update privacy page (`src/routes/[locale]/privacy/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.5 Update time zone converter page (`src/routes/[locale]/time-zone-converter/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.6 Update meeting converter page (`src/routes/[locale]/meeting-converter/+page.svelte`) navigation links to use `localizeHref()`
- [x] 1.7 Update footer component (`src/lib/components/app-footer.svelte`) links to use `localizeHref()`
- [x] 1.8 Search for any other components with hardcoded `href="/{page.params.locale}"` patterns and update them

## 2. Validation
- [ ] 2.1 Test language switching and verify all links maintain the selected locale
- [ ] 2.2 Test navigation from Thai locale to ensure links use `/th/` prefix
- [ ] 2.3 Test navigation from other locales (e.g., Spanish, Chinese) to ensure proper locale prefixes
- [ ] 2.4 Verify footer links work correctly across all locales
- [ ] 2.5 Verify mobile sidebar links work correctly across all locales
- [ ] 2.6 Verify desktop navbar links work correctly across all locales
- [ ] 2.7 Test that external links (mailto:, https://) are not affected
