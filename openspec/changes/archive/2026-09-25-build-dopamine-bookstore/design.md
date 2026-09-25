## Context

The repository contains OpenSpec configuration but no application. The supplied standalone HTML is the product and visual reference: **Depois Eu Leio**, a satirical, bilingual bookstore with 18 sample books, a catalog, wish list, cart, demo account, simulated checkout, order history, statistics, reviews, theme toggle, and contextual “roast” messages. Its key visual cues are a paper/ink base, yellow hero, red/blue/green/pink genre accents, thick black outlines, offset shadows, typographic book covers, and prominent display type.

The implementation needs to be a maintainable TanStack Start app using the requested stack. The storefront is a local demo: catalog data is bundled JSON and visitor state lives in the browser. The Windows reference path is `C:\Users\arthu\Downloads\Depois Eu Leio (1).html`; in this environment it is `/mnt/c/Users/arthu/Downloads/Depois Eu Leio (1).html`.

## Goals / Non-Goals

**Goals:**

- Recreate the reference's recognizable storefront and complete main interaction loop on desktop and mobile.
- Keep catalog content, saved state, form rules, translations, and computed statistics easy to change independently.
- Make the fictional nature of checkout unambiguous while keeping the humorous presentation.
- Use semantic controls, visible keyboard focus, reduced-motion support, and readable contrast.

**Non-Goals:**

- Real accounts, payments, bank/credit-card integration, product inventory, shipping, or server-side storage.
- A content-management interface or live product API.
- Literal reuse of the bundled HTML runtime or every one-off animation and toast rule.

## Decisions

### Application and routes

Scaffold TanStack Start with TypeScript and Tailwind. Use file routes for `/`, `/books/$bookId`, `/wishlist`, `/cart`, `/checkout`, `/checkout/complete/$orderId`, `/orders`, `/stats`, and `/account`. Keep the shared header, announcement strip, navigation, preferences, footer, and toast host in the root layout. Use route links so browser history, direct URLs, and refreshes work. The catalog is a static JSON import; no server function is needed for this release. Alternative considered: reproduce the reference's single `view` state. Routes give stable deep links and more natural Start structure.

### Catalog and data model

Extract and adapt the 18 reference book records into `src/data/books.json` with stable IDs, Portuguese/English titles and descriptions, author, genre, year, pages, BRL price, and optional former price. Validate the JSON once with a Zod schema, derive a lookup by ID, and use pure selectors for search/filtering and statistics. Format prices as BRL in both languages; the reference's fixed-rate USD conversion would suggest an exchange rate that does not exist in the demo. Keep decorative book covers as JSX/Tailwind compositions with no external cover dependency. Alternative considered: hard-code book objects in components; JSON is the requested editable store source.

### State and persistence

Use a small Zustand store with `persist`, a versioned local-storage key, and a `partialize` list covering cart IDs, wishlist IDs, profile, submitted reviews, orders, language, and theme. Store only IDs and immutable order snapshots needed for stable history; calculate cart totals and insights from current catalog data. Guard against unknown/deleted IDs and invalid or incompatible stored data, falling back to defaults. Keep search/filters, open menus, draft form fields, and toasts ephemeral. Delay persisted-state hydration until the browser mounts, with a neutral pending state for dependent UI, to prevent server/client markup mismatches. Alternative considered: scattered `useState` plus manual local-storage effects; a single store makes cross-route behavior and persistence more reliable.

### Forms, demo identity, and fictional checkout

Use React Hook Form with Zod and `zodResolver` for the demo identity form (name and email), review form (rating and text), and checkout choice/confirmation. A profile is just a browser-local display identity, not authentication. Do not request or store passwords, shipping addresses, card numbers, or other payment credentials. The checkout can visually present Pix/card/none choices as decorative simulation, but it must not display a bank-scannable QR code or usable Pix payload. Confirmation creates a local order with ID, timestamp, book snapshots/IDs, total, pages, and selected pretend method, then clears the cart. Alternative considered: mirror the reference's password and card fields; collecting those values would add no function to a fake store.

### Styling and components

Use Tailwind utility classes directly in JSX as the default styling method. Reserve the shared CSS entry for Tailwind imports, color/font tokens, a small set of necessary keyframes, and global focus/reduced-motion rules. Use complete class strings for conditional variants. Install shadcn/ui for suitable accessible primitives such as Button, Input, Select, Sheet, Dialog, Radio Group, and Toast/Sonner, then restyle them to match the reference instead of accepting default card styling. Typography: Archivo Black for logo/headlines, Work Sans for body, Space Mono for compact data, and restrained Bangers accents. Alternative considered: copying the reference's large inline-style template; the chosen structure makes responsive styling and component reuse easier.

### Tooling and environment

Add Ultracite as the formatting/linting gate plus typecheck and build scripts. The first release needs no environment variables; if configuration is later added, use `@t3-oss/env-core` with Zod and the appropriate client prefix. No TanStack Query layer is needed for static JSON and browser-local state. Alternative considered: adding query caching and environment scaffolding now; they add complexity without a remote data source.

## Risks / Trade-offs

- **Browser-local data can be cleared or is device-specific** → State this in account/checkout copy and handle unavailable storage with in-memory operation.
- **TanStack Start renders before local storage is available** → Rehydrate on mount and avoid rendering stored counts/profile/order-dependent content until hydration completes.
- **A broad reference can lead to a visually generic component kit** → Capture the reference's palette, type, cover system, border/shadow scale, and desktop/mobile layouts before building; review screenshots at both sizes.
- **Satirical feedback can become noisy or inaccessible** → Use concise dismissible messages, an `aria-live` region, and reduced-motion support; avoid feedback that blocks actions.
- **The demo checkout could be mistaken for a real payment** → Repeat “fictional/no charge” wording at entry and confirmation, with no usable banking artifact or sensitive inputs.

## Migration Plan

Create the app in this repository, then migrate the reference's book content and copy into typed data and translation files. Run lint/format, typecheck, build, and a focused browser smoke test of search, cart, checkout, persistence, and mobile navigation. There is no existing production app or data to migrate. Rollback is removal of this initial app commit; browser-local demo data is independent of any server.

## Open Questions

- None blocking. The implementation assumes “ts3” means T3 Env and uses it only if environment variables become necessary.
