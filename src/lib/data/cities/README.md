# Cities Data Structure

This directory contains city data organized by country code. Each country has its own JSON file named after the ISO 3166-1 alpha-2 country code (lowercase).

## Structure

```
cities/
├── index.ts          # Main export file that imports all country files
├── us.json          # United States cities
├── gb.json          # United Kingdom cities
├── jp.json          # Japan cities
└── ...              # Other country files
```

## File Format

Each country file contains an array of city objects:

```json
[
  {
    "id": "city-id",
    "name": "City Name",
    "country": "US",
    "timezone": "America/New_York",
    "label": "EDT/EST",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
]
```

## Usage

Import the `getAllCities()` function from `index.ts`:

```typescript
import { getAllCities, getCitiesByCountry } from '$lib/data/cities/index';

// Get all cities
const allCities = getAllCities();

// Get cities for a specific country
const usCities = getCitiesByCountry('US');
```

## Adding New Cities

1. Open the appropriate country file (e.g., `us.json` for US cities)
2. Add a new city object to the array
3. Ensure the `id` is unique and in kebab-case
4. Use valid IANA timezone identifiers
5. The `index.ts` file will automatically include the new city

## Benefits of This Structure

- **Smaller files**: Each country file is small and manageable
- **Better performance**: Only needed files are loaded
- **Easier maintenance**: Changes to one country don't affect others
- **Reduced context size**: AI tools can work with individual files instead of one large file
