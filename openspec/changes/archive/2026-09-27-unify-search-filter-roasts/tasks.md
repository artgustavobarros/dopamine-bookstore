## 1. UI Cleanup in Catalog Search

- [x] 1.1 Remove the non-functional `SlidersHorizontal` "Gênero" `div` next to the search input in `src/routes/index.tsx`.
- [x] 1.2 Verify that the search input spans cleanly across the search container without broken layout or misplaced elements.

## 2. Unified Exploration State and Trigger Cadence

- [x] 2.1 Replace separate category and search refs in `src/routes/index.tsx` with a unified exploration tracker that records changes to `genre`, `price`, `author`, `length`, and submitted `query`.
- [x] 2.2 Wire the roast trigger to fire at every multiple of 3 actions (`count % 3 === 0`), passing the active `filterType`, `filterValue`, and `filterPreviousValue`.
- [x] 2.3 Update `src/lib/roast-trigger.ts` with a unified exploration roast helper (`triggerExplorationRoast`) forwarding parameter context to the server roast function.

## 3. Parameter-Aware Roast Prompts and Deterministic Fallbacks

- [x] 3.1 Extend `roastInputSchema` and `buildUserMessage` in `src/lib/server/roast.ts` to process `filterType`, `filterValue`, and `filterPreviousValue` with tailored roast comedy instructions.
- [x] 3.2 Update `src/lib/roast-fallbacks.ts` with parameter-specific fallback roasts and tags (`[PECHINCHA INÚTIL]`, `[SÍNDROME DE INTELECTUAL]`, `[ILUSÃO DE PÁGINAS]`, `[TURISTA LITERÁRIO]`, `[BUSCA INFINITA]`) in both Portuguese and English.

## 4. Verification and Automated Testing

- [x] 4.1 Update `tests/storefront.spec.ts` to assert that the inert genre badge is removed and that mixing 3 distinct filter/search changes triggers the contextual roast.
- [x] 4.2 Run tests with `pnpm test` and verify that the test suite and typechecks pass without regression.
