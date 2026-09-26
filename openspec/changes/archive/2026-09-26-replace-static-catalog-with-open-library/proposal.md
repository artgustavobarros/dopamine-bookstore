## Why

The bookstore currently ships a fixed 18-book JSON catalog. Loading bibliographic data from Open Library gives visitors a live catalog in the selected language without operating an API or maintaining book records in the repository.

## What Changes

- Replace bundled book records with Open Library search results and edition metadata, fetched through Axios and cached with TanStack Query.
- Search for Portuguese or English editions according to the existing language setting, using stable Open Library work IDs across language changes.
- Show separate loading, request-error, no-results, and unavailable-in-selected-language states, following the existing EmptyState presentation.
- Keep the explicitly fictional checkout and derive stable demonstration prices locally because Open Library does not provide store prices.
- Preserve cart, wishlist, reviews, and completed order behavior when remote catalog results change or a language lacks an edition.

## Capabilities

### New Capabilities

- `remote-book-catalog`: Fetch, validate, cache, and present Open Library book and edition data by selected language.

### Modified Capabilities

- `catalog-discovery`: Replace the local JSON catalog requirement with remote browsing, filtering, and language-aware empty states.
- `shopping-lists`: Persist selected remote books so cart and wishlist remain useful after reload or catalog changes.

## Impact

Catalog modeling, home and detail routes, saved-book state, localization, README, and end-to-end tests change. Add `@tanstack/react-query` and `axios`; no environment variable or application API endpoint is required.
