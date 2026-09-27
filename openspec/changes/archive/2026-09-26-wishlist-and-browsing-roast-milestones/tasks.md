## 1. Server Schema, Prompts & Fallbacks

- [x] 1.1 Extend `roastInputSchema` in `src/lib/server/roast.ts` to include `wishlist_milestone_pages`, `category_switch_milestone`, and `search_milestone` event types and browsing metadata.
- [x] 1.2 Update prompt builder and system prompts in `src/lib/server/roast.ts` with satirical instructions for wishlist hoarding, genre hopping, and search paralysis.
- [x] 1.3 Add deterministic bilingual fallback roasts and sound-effect tags in `src/lib/roast-fallbacks.ts` for the 3 new events.

## 2. Wishlist Pages Milestone Triggers

- [x] 2.1 Implement `handleToggleWishWithMilestones` in `src/lib/roast-trigger.ts` to evaluate cumulative wishlist pages crossing 1,000 and 2,000 pages.
- [x] 2.2 Connect `handleToggleWishWithMilestones` to wishlist action buttons in `src/components/store/book-card.tsx`.
- [x] 2.3 Connect `handleToggleWishWithMilestones` to wishlist action button in `src/routes/books/$bookId.tsx`.

## 3. Catalog Discovery Indecision Triggers

- [x] 3.1 Track catalog category/genre switches in `src/routes/index.tsx` and trigger the indecision roast toast when switching more than 3 times in a session.
- [x] 3.2 Track distinct catalog search queries in `src/routes/index.tsx` and trigger the search paralysis roast toast when searching more than 3 times in a session.

## 4. Verification & Testing

- [x] 4.1 Run type-checks, linter, and build (`pnpm check`, `pnpm build`) to ensure zero regressions.
- [x] 4.2 Verify new toast scenarios with end-to-end test cases in `tests/storefront.spec.ts`.
