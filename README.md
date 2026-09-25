# Depois Eu Leio

A fictional bookstore built with TanStack Start. Browse books, save a wishlist, fill a cart, and complete an imaginary order. No money changes hands. The catalog is local JSON and visitor activity is saved only in this browser.

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

- `src/data/books.json` contains the 18 sample books.
- `src/lib/catalog.ts` validates catalog data and handles search and formatting.
- `src/lib/store.ts` owns the versioned Zustand store (`depois-eu-leio-v1` in local storage).
- `src/lib/i18n.ts` contains Portuguese and English UI copy.
- `src/routes` contains TanStack Start pages.
- `src/components/store` contains the shared storefront presentation.
- `docs/design-reference.md` records the reference's visual tokens.

The original reference is `C:\Users\arthu\Downloads\Depois Eu Leio (1).html`. Checkout is decorative: the app does not request a password, address, card details, or a Pix payment.
