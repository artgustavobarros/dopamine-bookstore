## 1. Remote data foundation

- [x] 1.1 Add Axios and TanStack Query, configure the root QueryClient provider, and define locale-aware query keys and cache behavior.
- [x] 1.2 Build and validate the Open Library search/detail adapter, including matching-language edition titles, stable work IDs, optional metadata, and deterministic demo prices.

## 2. State and storefront

- [x] 2.1 Persist remote book snapshots for cart and wishlist, preserve order snapshots, and safely migrate old saved state.
- [x] 2.2 Convert home catalog and text search to remote queries; update filtering, featured books, and loading/error/empty states.
- [x] 2.3 Convert detail, cart, wishlist, and checkout flows to remote books and show the selected-language-unavailable state.
- [x] 2.4 Add localized explanatory copy and reuse the storefront EmptyState presentation for remote states.

## 3. Cleanup and verification

- [x] 3.1 Remove the bundled book JSON and update README to describe the live catalog and fictional prices.
- [x] 3.2 Adapt meaningful browser tests for network fixtures and run checks, typecheck, build, and end-to-end tests.
