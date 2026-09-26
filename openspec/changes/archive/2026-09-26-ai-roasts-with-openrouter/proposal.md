## Why

The current storefront uses static, simple toasts that only hint at the satirical premise of "Depois Eu Leio" (*Dopamine Bookstore*). Visitors buying fictional books and hoarding pages expect the sharp, acidic, "roast show" humor of book hoarder habits (*tsundoku*, buying 1,000-page tomes as intellectual decoration, pretending they will read in 12x installments). Generating dynamic roasts using OpenRouter's free tier models brings this satirical experience to life while maintaining reliable local fallbacks and zero API cost.

## What Changes

- Add a server-side roast generation engine powered by OpenRouter's free models (`openrouter/free` router with fallback to `qwen/qwen3.8-27b:free` / `google/gemma-4-31b-it:free`).
- Implement milestone-based reactive roasts (Option B): triggers on key decision points such as cart reaching 3+ books, exceeding 1,000 pages, opening checkout, or completing an order, featuring a punchy sound-effect tag (e.g., `[ALERTA!]`, `[TERAPIA JÁ]`, `[DE NOVO?!]`).
- Implement a dedicated "Diagnóstico do Leitor" (Reader's Roast / Fritada Literária) card in `/stats` (Option C) that performs an acidic psychological evaluation of the visitor's reading delusions.
- Protect the UI with a reliable fallback engine: if OpenRouter is unreachable, times out (>2s), or hits rate limits (HTTP 429), fall back immediately to curated static roasts.
- Support bilingual output in Brazilian Portuguese and English matching the user's active locale.

## Capabilities

### New Capabilities
- `ai-roast-generator`: Server-side OpenRouter integration and prompt engine calibrated for stand-up roast humor, handling authentication, caching, rate limiting, and fallback responses.

### Modified Capabilities
- `reading-insights`: Expand the requirement for humorous feedback to support AI-driven milestone toasts and add a new requirement for the dedicated "Diagnóstico do Leitor" psychological roast panel on the statistics page.

## Impact

- Server code: new TanStack Start server function `generateRoastFn` and `generateDiagnosisFn` in `src/lib/server/roast.ts` or `src/lib/roast.ts`.
- Environment: support `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` (default: `openrouter/free`), and `OPENROUTER_SITE_URL`.
- Client code: integration into `src/routes/stats.tsx`, `src/routes/checkout/index.tsx`, and cart milestone triggers.
- UI dependencies: uses existing `sonner` toast system and Tailwind design tokens (`#ffd84a`, `#141210`, `#f4f3ee`).
