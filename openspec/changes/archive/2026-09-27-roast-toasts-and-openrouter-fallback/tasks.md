## 1. Catalog Definition & Rule Engine

- [x] 1.1 Define TypeScript schemas and interfaces for events, priority tiers, rules, variants, stings, context parameters, and session storage state in `src/lib/roasts.ts`
- [x] 1.2 Implement the full bilingual offline roast catalog in `src/lib/roasts.ts` covering all 16 events meeting content quotas (>=3 variants per rule, >=5 generic, >=8 stings, >=6 card-declined, >=3 pix-expired, >=2 delivery stages)
- [x] 1.3 Implement the rule selection algorithm with specificity ordering, level gating (`educado`, `normal`, `impiedoso`), dynamic stings for `impiedoso` (actions > 3), and weighted random selection
- [x] 1.4 Implement localized token interpolation (`{pages}`, `{total}`, `{hours}`, `{title}`, `{author}`, `{n}`, `{name}`) with locale-aware number and currency formatting
- [x] 1.5 Implement session memory tracking in `sessionStorage` (`del_roast_state`) for anti-repetition (exclude last 2 variants, max 2 occurrences per session) and cadence cooldowns (4s for P2, 10s for P3)

## 2. Toast Presentation & Interactions

- [x] 2.1 Update `<ComicToast />` to support optional micro-action button (`sm secondary`, max 18 chars), 44×44px accessible touch target for close button (`×`), and normalized `aria-label` for onomatopoeias
- [x] 2.2 Add CSS keyframe animations for onomatopoeia entrance wobble (`del-shake`: 2deg for 200ms) and exit animation (fade + 12px right over 200ms), respecting `prefers-reduced-motion`
- [x] 2.3 Implement dynamic duration calculation (`6s` base + `40ms/char` over 80 characters, max 12s) and hover/focus countdown pause
- [x] 2.4 Add keyboard `Esc` listener to dismiss the newest toast and horizontal touch swipe-right gesture handler on mobile
- [x] 2.5 Support `role="alert"` for P1 errors (`card-declined`, `pix-expired`) and `role="status"` with `aria-live="polite"` for standard toasts

## 3. OpenRouter AI Prompt Calibration & Offline Fallback

- [x] 3.1 Update system prompt in `src/lib/server/roast.ts` with the bookstore tone guide (mock habit not person, real data, no emojis, dry irony, "você", max 140 chars) and structured user prompt with context plus 3 catalog few-shot examples
- [x] 3.2 Configure OpenRouter client call with strict 1.5s timeout (`timeoutMs: 1500`) and response validation (≤140 chars, no emoji, matches requested locale)
- [x] 3.3 Connect deterministic fallback to evaluate and return a candidate from `src/lib/roasts.ts` whenever OpenRouter times out, fails validation, throws an error, or lacks an API key
- [x] 3.4 Implement session-level caching keyed by `event + rule` to prevent duplicate AI generations for identical contextual triggers

## 4. Event Wiring Across Storefront

- [x] 4.1 Wire `cart-opened`, `cart-removed`, `book-added`, and `book-readded` actions with rapid burst aggregator (<600ms)
- [x] 4.2 Wire checkout lifecycle toasts: `checkout-started`, `pix-copied`, `pix-expired`, `card-declined`, `purchase-completed`, and inline error sync
- [x] 4.3 Wire account and social toasts: `login-required`, `login`, `wish-added`, and `review-posted`
- [x] 4.4 Wire order tracking (`delivery-stage`, `delivered`) and 90-second store inactivity timer (`idle`)

## 5. Testing & Acceptance Verification

- [x] 5.1 Add unit tests for `roasts.ts` covering rule matching, intensity filtering, sting attachment, interpolation formatting, and anti-repetition memory
- [x] 5.2 Add unit and component tests for dynamic duration, hover pause, and 140-character validation
- [x] 5.3 Run integration / end-to-end tests validating the complete roast flow, fallback resilience without API key, and accessibility roles
