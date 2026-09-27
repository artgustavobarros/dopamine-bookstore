## 1. Storefront Layout Restructuring

- [x] 1.1 Update outer container in `src/components/store/layout.tsx` to include `flex min-h-screen min-h-dvh flex-col`
- [x] 1.2 Update `<main id="main-content">` landmark in `src/components/store/layout.tsx` to include `flex-1 flex flex-col`
- [x] 1.3 Verify footer positioning and margins in `src/components/store/layout.tsx` to ensure seamless anchoring at the bottom

## 2. Route Verification and Test Validation

- [x] 2.1 Verify empty state and short content routes (empty cart, empty wishlist, 404 page) anchor the footer to the bottom of the viewport
- [x] 2.2 Verify long scrollable content pages (catalog, book detail) scroll naturally with the footer positioned below content
- [x] 2.3 Run test suite and linters to verify zero regressions
