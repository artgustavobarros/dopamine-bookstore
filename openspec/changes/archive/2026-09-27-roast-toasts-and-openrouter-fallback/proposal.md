## Why

The storefront's satire relies on roast toasts ("manifestações") as its primary feedback loop, but current notifications diverge from the rich standalone reference (`Depois Eu Leio (1).html`) and lack a cohesive rule engine, anti-repetition memory, burst handling, and nuanced intensity levels. Furthermore, the OpenRouter AI generation lacks prompt calibration matching the store's satirical tone guide and structured context, and lacks a robust deterministic fallback to the standalone roast catalog when requests fail or exceed latency budgets.

## What Changes

- **Roast Manifestation Engine**: Implement the complete event catalog (16 events including `book-added`, `book-readded`, `cart-opened`, `checkout-started`, `login-required`, `login`, `wish-added`, `review-posted`, `pix-copied`, `pix-expired`, `card-declined`, `purchase-completed`, `delivery-stage`, `delivered`, `idle`, and `cart-removed`) with ordered specific-to-generic rules, anti-repetition history, cooldowns, and burst aggregation (<600ms).
- **Intensity Levels & Stings**: Support `educado` (polite, specific data only, no stings), `normal` (default), and `impiedoso` (ruthless, appends a stinging tailphrase after 3 actions) levels.
- **Toast Anatomy & Interaction Enhancements**:
  - Add optional micro-action button (`sm secondary`, max 18 characters) for contextual shortcuts ("Ver carrinho", "Desfazer", "Tentar de novo").
  - Dynamically scale duration (`6s` base + `40ms/char` over 80 chars, max 12s) with hover/focus pause.
  - Implement dismiss via `Esc` key and mobile swipe-right, with 44×44px accessible touch target for close button (`×`).
  - Introduce onomatopoeia shake (`2deg` for 200ms) upon entrance and 12px exit slide.
  - Set `role="alert"` for P1 errors (`card-declined`, `pix-expired`) and `role="status"` with `aria-live="polite"` for general toasts.
- **OpenRouter AI Prompt Calibration & Offline Fallback**:
  - Re-engineer the OpenRouter server function prompt using the standalone roast tone guide (irony targeting habit not person, real quantitative data, concise phrasing ≤ 140 chars, no emojis, dry affirmative punchlines).
  - Add session caching by `event + rule` to prevent duplicate AI calls.
  - Enforce a 1.5-second timeout and validation check on AI responses, seamlessly falling back to the deterministic offline catalog.

## Capabilities

### New Capabilities
- `roast-manifestations`: Comprehensive event-driven roast engine covering catalog dispatching, rule selection algorithms, intensity tiers (`educado`, `normal`, `impiedoso`), stings, burst aggregation, session memory anti-repetition, and localized text interpolation.

### Modified Capabilities
- `comic-toast-notifications`: Expand comic speech bubble toast presentation with optional action buttons, dynamic duration scaling, hover/focus timer pause, dismiss interactions (`Esc`, swipe), SFX shake motion, and polite vs. alert ARIA roles.
- `ai-roast-generator`: Calibrate OpenRouter prompt with the store's satirical tone rules and structured action contexts, enforce strict character limits and 1.5s timeout, cache generations by session event-rule, and integrate the full offline catalog as fallback.

## Impact

- **Client Code**:
  - Toast components (`src/components/ui/comic-toast.tsx`, `src/lib/roast-toast.tsx`) to support action buttons, hover pause, swipe dismiss, and dynamic duration.
  - Trigger utilities (`src/lib/roast-trigger.ts`) and store/action dispatchers across cart, wishlist, checkout, delivery, and idle monitors to route through the new manifestation dispatcher.
  - Toast state storage in `sessionStorage` for anti-repetition rules, variant weights, cooldown timestamps, and action counts.
- **Server Code**:
  - `src/lib/server/roast.ts` updated with 1.5s timeout, validated tone prompt, cache layer, and integration with `src/lib/roast-fallbacks.ts` (or `src/lib/roasts.ts`).
- **Dependencies**: No external runtime dependencies required; uses existing `@openrouter/sdk`, `sonner`, and native web standards.
