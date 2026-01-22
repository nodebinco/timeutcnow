<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agents Documentation

## Tech Stack

- **Framework**: SvelteKit
- **Runtime**: Bun
- **UI Framework**: DaisyUI
- **Icons**: Lucide Svelte
- **Storage**: IndexedDB (not localStorage)

## File Naming Conventions

- Use **kebab-case** for all file names
- Examples:
  - `user-profile.svelte`
  - `api-utils.ts`
  - `data-store.ts`
  - `time-utils.ts`

## Storage Guidelines

- **Always use IndexedDB** for client-side data persistence
- **Never use localStorage** for storing application data
- IndexedDB provides:
  - Better performance for large datasets
  - Asynchronous operations
  - Structured data storage
  - Better browser storage limits

## Development Workflow

### Running the Project

```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Package Management

- Use `bun` for all package operations:
  - `bun install` - Install dependencies
  - `bun add <package>` - Add a new dependency
  - `bun add -d <package>` - Add a dev dependency

## Project Structure

- `src/routes/` - SvelteKit routes (use kebab-case for route files)
- `src/lib/` - Shared components and utilities
- `static/` - Static assets

## Icons

- **Use Lucide Svelte** for all icons in the project
- Import icons directly from `lucide-svelte`
- Icons are tree-shakeable and optimized for Svelte

### Usage Example

```svelte
<script lang="ts">
  import { Clock, Calendar, Settings } from 'lucide-svelte';
</script>

<Clock size={24} />
<Calendar size={20} class="text-primary" />
<Settings size={16} />
```

### Icon Naming

- Icons use PascalCase (e.g., `Clock`, `User`, `Settings`)
- Check available icons at: https://lucide.dev/icons/
- All icons support standard props: `size`, `color`, `class`, `strokeWidth`, etc.

## Best Practices

1. **File Names**: Always use kebab-case
2. **Storage**: Use IndexedDB, never localStorage
3. **Icons**: Use Lucide Svelte for all icons
4. **Components**: Place reusable components in `src/lib/`
5. **Routes**: Follow SvelteKit routing conventions with kebab-case file names
6. **TypeScript**: Use TypeScript for all new files

## IndexedDB Usage Example

When implementing data persistence, create utilities in `src/lib/` with kebab-case naming:

```typescript
// src/lib/indexed-db-utils.ts
export async function openDatabase(dbName: string, version: number) {
  // IndexedDB implementation
}
```
