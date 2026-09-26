## 1. OpenRouter Server Integration & Fallbacks

- [x] 1.1 Add environment variable definitions for `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.example`
- [x] 1.2 Implement the curated fallback library (`src/lib/roast-fallbacks.ts`) with deterministic sarcastic roasts for offline/rate-limited scenarios
- [x] 1.3 Implement `generateRoastFn` using `createServerFn` in `src/lib/server/roast.ts` with "fritada" roast-show prompt, structured JSON parsing, and a 2.5s AbortController

## 2. Milestone AI Roast Toasts (Option B)

- [x] 2.1 Enhance toast presentation with custom sound-effect tags (`[ALERTA!]`, `[TERAPIA JÁ]`) styled in paper-and-ink visual language
- [x] 2.2 Implement milestone tracking and trigger hooks in cart store (crossing 3+ books, exceeding 1,000 pages)
- [x] 2.3 Connect milestone roasts to checkout route entry and order completion in `src/routes/checkout/index.tsx`

## 3. Reader's Psychological Roast Card (Option C)

- [x] 3.1 Implement `generateDiagnosisFn` server function for in-depth psychological reading habit evaluations
- [x] 3.2 Create the "Diagnóstico do Leitor" (`ReaderRoastCard`) component with satirical loading states and paper-ink typography
- [x] 3.3 Embed the roast card into `src/routes/stats.tsx` with session caching and bilingual support (`pt`/`en`)

## 4. Verification & Polish

- [x] 4.1 Verify TypeScript typechecking and Ultracite/Biome formatting (`pnpm run typecheck`, `pnpm check`)
- [x] 4.2 Validate fallback resilience when API key is unset or OpenRouter free endpoints throttle
