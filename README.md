# Depois Eu Leio

A fictional bookstore built with TanStack Start. Browse books, save a wishlist, fill a cart, and complete an imaginary order. No money changes hands. Book metadata comes from the public Open Library API; visitor activity is saved only in this browser.

## Run

```bash
pnpm install
pnpm run dev
```

Open the URL printed by Vite (normally `http://localhost:3000`).

## Checks

```bash
pnpm run check
pnpm run typecheck
pnpm run build
pnpm run test:e2e
```

`pnpm run format` applies Ultracite fixes. Playwright's Chromium is needed for the browser tests (`pnpm exec playwright install chromium` if it is not already installed).

## Project structure

- `src/lib/open-library.ts` fetches Portuguese and English editions with Axios and TanStack Query. [Open Library](https://openlibrary.org/developers/api) is free for low-volume, human-facing discovery; no API key or environment variable is needed. Requests are cached and spaced apart, and search input is debounced.
- `src/lib/catalog.ts` validates book data and handles filtering and formatting. Prices are stable demonstration values derived from Open Library work IDs, not retailer prices.
- `src/lib/store.ts` owns the versioned Zustand store (`depois-eu-leio-v1` key, schema version 2 in local storage). Cart and wishlist entries retain a snapshot so they remain readable when the remote catalog changes.
- `src/lib/i18n.ts` contains Portuguese and English UI copy.
- `src/routes` contains TanStack Start pages.
- `src/components/store` contains the shared storefront presentation.
- `docs/design-reference.md` records the reference's visual tokens.

The original reference is `C:\Users\arthu\Downloads\Depois Eu Leio (1).html`. Checkout is decorative: the app does not request a password, address, card details, or a Pix payment.

The selected language constrains Open Library search to editions in Portuguese or English. Some works have no edition in one language; the detail page explains that case. The page count is a work-level median when available and may differ from the displayed edition. An unavailable API shows a retry state.
