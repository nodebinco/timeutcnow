# Project Context

## Purpose

**timeutcnow.com** is a full-featured UTC time website that provides accurate, real-time UTC time display with internationalization support. The project focuses on creating a beautiful, usable, responsive, and SEO-optimized web application that helps users quickly access UTC time information.

### Goals
- Provide accurate UTC time display with real-time updates
- Support multiple languages (i18n) for global accessibility
- Deliver a beautiful, modern UI with excellent UX
- Ensure full responsiveness across all device types
- Optimize for SEO to maximize discoverability
- Create reusable, maintainable components and patterns

### Reference Examples
- https://time.is/ - Clean, simple time display
- https://time.now/ - Modern time interface
- https://www.worldtimebuddy.com/ - Multi-timezone comparison
- https://www.utctime.net/ - UTC-focused time display
- https://currenttimeutc.com/ - Current UTC time reference

## Tech Stack

### Core Framework
- **SvelteKit** - Full-stack framework for building the application
- **TypeScript** - Type-safe development
- **Bun** - Runtime and package manager

### UI & Styling
- **DaisyUI** - Component library built on Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Svelte** - Icon library (tree-shakeable, optimized for Svelte)

### Build Tools
- **Vite** - Build tool and dev server
- **SvelteKit Adapter Auto** - Automatic adapter selection for deployment

## Project Conventions

### Code Style

#### File Naming
- **Always use kebab-case** for all file names
- Examples:
  - `user-profile.svelte`
  - `api-utils.ts`
  - `data-store.ts`
  - `time-utils.ts`
  - `i18n-config.ts`

#### TypeScript
- Use TypeScript for all new files
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Leverage Svelte's type system for component props

#### Component Structure
- Place reusable components in `src/lib/`
- Use Svelte 5 runes syntax (`$state`, `$derived`, `$effect`)
- Keep components focused and single-purpose
- Extract logic to utility functions when reusable

#### Code Formatting
- Follow Svelte and TypeScript best practices
- Use consistent indentation (spaces or tabs as configured)
- Keep functions small and focused
- Use meaningful variable and function names

### Architecture Patterns

#### Component Organization
- **Routes**: `src/routes/` - SvelteKit routes (use kebab-case for route files)
  - Use SvelteKit's `[lang]` parameter for language routing: `src/routes/[lang]/`
  - Example structure: `src/routes/[lang]/utc-to-est/+page.svelte`
- **Components**: `src/lib/components/` - Reusable UI components
- **Utilities**: `src/lib/utils/` - Helper functions and utilities
- **Stores**: `src/lib/stores/` - State management (use Svelte 5 runes)
- **Types**: `src/lib/types/` - TypeScript type definitions
- **i18n**: Paraglide translations (typically in `messages/` or `src/lib/i18n/`)
  - Paraglide uses a compiler-based approach with message files
  - Translations are typically stored in `messages/[lang].json` or similar
  - Paraglide generates type-safe translation functions automatically
  - Use `$t()` function in components for translations

#### State Management
- Prefer Svelte 5 runes (`$state`, `$derived`, `$effect`) over stores when possible
- Use stores for cross-component state that needs reactivity
- Keep state as close to where it's used as possible

#### Data Persistence
- **Always use IndexedDB** for client-side data persistence
- **Never use localStorage** for storing application data
- IndexedDB provides better performance, async operations, and larger storage limits

#### Internationalization (i18n)
- Support multiple languages from the start
- **Use Paraglide** - Compiler-based, type-safe i18n library for SvelteKit
- Paraglide provides:
  - Type-safe translations with compile-time checks
  - Automatic code splitting per language
  - Optimized bundle size (only loads needed translations)
  - Simple API with `$t()` function
- Store translations in structured format (typically in `src/lib/i18n/` or `messages/`)
- Support language detection and manual selection
- Ensure all user-facing text is translatable
- **Each page must have translated content** including:
  - Page title and meta description
  - Main content and descriptions
  - UI labels and buttons
  - Help text and tooltips

#### Multi-Page Structure
- Support multiple pages with unique functionality:
  - `/utc-to-est` - UTC to EST time converter
  - `/unix-timestamp` - Unix timestamp converter and display
  - `/bangkok-time` - Current Bangkok time
  - `/thailand-time` - Current Thailand time
  - `/indo-time` - Current Indonesia time
  - `/countdown-timer` - Countdown timer tool
  - Additional time-related pages as needed
- Each page must be accessible in all supported languages
- URL structure: `/[lang]/[page-slug]` (e.g., `/en/utc-to-est`, `/th/utc-to-est`)
- Default language (English) can be accessed without prefix: `/utc-to-est` → `/en/utc-to-est`

### Testing Strategy

#### Testing Approach
- Write tests for critical functionality (time calculations, timezone conversions)
- Test components in isolation when possible
- Focus on user-facing behavior over implementation details
- Use Svelte Testing Library for component tests
- Test i18n functionality across supported languages

#### Test Organization
- Unit tests: `src/lib/**/*.test.ts`
- Component tests: `src/lib/**/*.spec.svelte` or co-located test files
- Integration tests: `tests/integration/`

### Git Workflow

#### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- Feature branches: `feature/description` or `feat/description`
- Bug fixes: `fix/description` or `bugfix/description`

#### Commit Conventions
- Use clear, descriptive commit messages
- Follow conventional commits format when possible:
  - `feat: add UTC time display component`
  - `fix: correct timezone calculation`
  - `refactor: improve i18n structure`
  - `style: update component styling`
  - `docs: update README`

## Domain Context

### Page Structure & Routing

#### Supported Pages
The application will have multiple pages, each with unique functionality and SEO-optimized content:

1. **Home/UTC Time** (`/` or `/utc-time`)
   - Current UTC time display
   - Real-time updates
   - UTC time information and explanation

2. **UTC to EST** (`/utc-to-est`)
   - UTC to Eastern Standard Time converter
   - Conversion tool with explanations
   - Content about UTC and EST timezones

3. **Unix Timestamp** (`/unix-timestamp`)
   - Unix timestamp converter
   - Convert between Unix timestamp and human-readable date
   - Explanation of Unix timestamps

4. **Bangkok Time** (`/bangkok-time`)
   - Current Bangkok time display
   - Bangkok timezone information
   - Content about Bangkok timezone (ICT)

5. **Thailand Time** (`/thailand-time`)
   - Current Thailand time display
   - Thailand timezone information
   - Content about Thailand timezone

6. **Indonesia Time** (`/indo-time`)
   - Current Indonesia time display
   - Indonesia timezone information (WIB, WITA, WIT)
   - Content about Indonesia timezones

7. **Countdown Timer** (`/countdown-timer`)
   - Countdown timer tool
   - Set custom countdowns
   - Timer functionality and explanations

8. **Additional Pages** (as needed)
   - Other timezone converters
   - Time-related tools
   - Timezone information pages

#### Routing Structure
- Use SvelteKit's `[lang]` parameter for language support
- Route structure: `src/routes/[lang]/[page-slug]/+page.svelte`
- Default language handling: `/page-slug` redirects to `/en/page-slug`
- Language codes: `en`, `th`, `id`, etc. (ISO 639-1 codes)

#### SEO Content Requirements per Page
Each page MUST include:
- **Unique H1 heading** with target keywords
- **Meta title** (50-60 characters, unique per page)
- **Meta description** (150-160 characters, unique per page)
- **Main content section** with:
  - Explanation of the page's purpose
  - How to use the tool/feature
  - Relevant timezone or time information
  - FAQs or additional helpful information
- **Structured data (JSON-LD)** specific to the page type
- **Internal links** to related pages
- **Proper heading hierarchy** (H1 → H2 → H3)

### Time Display Requirements
- Display current UTC time with high precision
- Update time display in real-time (every second or sub-second)
- Show date information alongside time
- Support multiple time format options (12-hour, 24-hour)
- Display timezone information clearly
- Support timezone conversions
- Display multiple timezones simultaneously when needed

### Internationalization Requirements
- Support multiple languages (English as base, expand to others)
- Localize date/time formats per locale
- Support RTL languages if needed
- Provide language switcher in UI
- Detect user's preferred language from browser settings
- **Each page must be available in all supported languages**
- URL structure must support language prefixes (e.g., `/en/utc-to-est`, `/th/utc-to-est`)
- All page content (including SEO meta tags) must be translatable
- Implement proper hreflang tags for SEO

### SEO Requirements
- **Each page MUST have unique, valuable content** for SEO purposes
- Optimize meta tags (title, description, keywords) for each page
- Use semantic HTML structure with proper heading hierarchy (H1, H2, H3)
- Add structured data (JSON-LD) for time information on each page
- Ensure fast page load times (< 2 seconds)
- Optimize for Core Web Vitals (LCP, FID, CLS)
- Create unique, descriptive content for each page topic
- Include relevant keywords naturally in page content
- Add internal linking between related pages
- Generate sitemap.xml for all pages and languages
- Implement hreflang tags for multi-language pages

### UI/UX Requirements
- Beautiful, modern design using DaisyUI components
- Fully responsive (mobile, tablet, desktop)
- Accessible (WCAG compliance)
- Fast and performant
- Clear visual hierarchy
- Intuitive navigation

## Important Constraints

### Technical Constraints
- Must work in all modern browsers
- Must be fully responsive (mobile-first approach)
- Must support server-side rendering (SSR) via SvelteKit
- Must use IndexedDB for any client-side storage (not localStorage)
- Must use kebab-case for all file names

### Performance Constraints
- Page load time should be < 2 seconds
- Time updates should be smooth without jank
- Minimize JavaScript bundle size
- Optimize images and assets

### SEO Constraints
- **Each page MUST have unique, valuable content** - no duplicate or thin content
- All content must be crawlable by search engines (no client-side only content for SEO)
- Meta descriptions and titles must be unique and optimized per page
- Structured data (JSON-LD) must be valid and page-specific
- URLs must be SEO-friendly and descriptive
- Content must be meaningful and provide value to users
- Minimum content length: Each page should have substantial, useful content (not just a tool)
- Internal linking structure must be logical and help SEO

### Accessibility Constraints
- Must meet WCAG 2.1 AA standards
- Must support keyboard navigation
- Must have proper ARIA labels
- Must support screen readers

## External Dependencies

### Time & Timezone Libraries
- Consider using libraries for timezone handling:
  - `date-fns-tz` - Timezone-aware date operations
  - `luxon` - Modern date/time library with timezone support
  - Or native JavaScript `Intl` API for timezone formatting

### Internationalization Libraries
- **Paraglide** - Compiler-based, type-safe i18n library for SvelteKit
  - Package: `@inlang/paraglide-sveltekit`
  - Provides type-safe translations with compile-time validation
  - Automatic code splitting per language
  - Optimized for SvelteKit routing and SSR
  - Documentation: https://inlang.com/m/gerre34r/library-inlang-paraglideSvelteKit

### SEO & Analytics
- Consider adding analytics (e.g., Google Analytics, Plausible)
- Consider adding structured data validation tools
- May need sitemap generation for SEO

### Deployment
- SvelteKit adapter will be determined by deployment target
- Consider static site generation (SSG) for better performance
- May need environment variables for configuration
