## 1. Project foundation

- [x] 1.1 Scaffold a TypeScript TanStack Start app in this repository with working dev, typecheck, and build scripts.
- [x] 1.2 Configure Tailwind, Ultracite lint/format scripts, the `@/*` alias, and the shared CSS entry; verify the scaffold builds.
- [x] 1.3 Initialize shadcn/ui for TanStack Start and add the accessible primitives needed by navigation, forms, checkout, and feedback.

## 2. Reference design and catalog

- [x] 2.1 Record the reference's color, font, spacing, border, shadow, and responsive layout tokens; implement them with Tailwind utilities in JSX and minimal shared CSS.
- [x] 2.2 Extract the 18 reference books into `src/data/books.json` and validate the catalog with a Zod schema and stable ID lookup.
- [x] 2.3 Add Portuguese and English UI copy, localized book fields, BRL formatting, and theme/language controls.
- [x] 2.4 Build the shared announcement strip, responsive header/mobile menu, navigation, footer, toast host, and hero.
- [x] 2.5 Build reusable typographic book covers and responsive catalog cards matching the reference's colored genre treatment.

## 3. Catalog discovery

- [x] 3.1 Implement the home catalog with accent-insensitive search, combined genre/price/author/length filters, result count, and a clearable empty state.
- [x] 3.2 Implement direct book-detail routes with metadata, reading estimates, price, sample reviews, and a useful unknown-book state.

## 4. Browser state and lists

- [x] 4.1 Implement the versioned Zustand store with safe client hydration, local-storage persistence, stored-data validation, and in-memory fallback.
- [x] 4.2 Implement cart and wishlist add/remove actions, duplicate prevention, persisted counts, and a move-wishlist-to-cart action.
- [x] 4.3 Build cart and wishlist routes with empty states, derived cart subtotal/pages/hours/savings, and working detail links.
- [x] 4.4 Verify reloading restores lists and preferences without hydration errors; verify malformed saved data does not break the app.

## 5. Demo identity and reviews

- [x] 5.1 Build the demo account form with React Hook Form, Zod, and `zodResolver`, saving only name/email and supporting sign-out.
- [x] 5.2 Add a return destination so visitors who sign in from checkout or a book review resume the intended action.
- [x] 5.3 Build the validated 1-to-5-star review form and persist submitted reviews by book ID without collecting a password.

## 6. Fictional checkout and orders

- [x] 6.1 Build checkout with a clear no-charge notice, order summary, and validated pretend payment choice, without real payment fields or Pix data.
- [x] 6.2 Implement one-time local order creation, cart clearing, and a direct confirmation route that reports a zero real charge.
- [x] 6.3 Build reverse-chronological order history with dates, books, totals, reading estimates, and an empty state.
- [x] 6.4 Verify empty-cart, missing-profile, refresh, and repeat-confirmation behavior cannot create accidental duplicate orders.

## 7. Insights and final verification

- [x] 7.1 Implement statistics derived from saved orders, including zero-state, pretend spend, counts, pages, hours, favorite genre, and average length.
- [x] 7.2 Add contextual, dismissible humorous feedback for cart, wishlist, review, and order actions with accessible announcements.
- [x] 7.3 Check desktop and mobile layouts against the reference, keyboard navigation, focus, contrast, and reduced-motion behavior.
- [x] 7.4 Run Ultracite, typecheck, production build, and a focused browser smoke test covering search, lists, demo identity, review, checkout, orders, stats, and reload persistence.
