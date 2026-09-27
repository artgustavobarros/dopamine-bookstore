## Context

The Dopamine Bookstore ("Depois Eu Leio") uses satirical roast toasts ("manifestações") as its signature user feedback mechanism. The standalone reference (`Depois Eu Leio (1).html`) defined a rich set of comic rules, sound effect headers, intensity modes (`educado`, `normal`, `impiedoso`), dynamic stings, and session memory.

The current implementation in the TanStack Start app has diverged: it uses basic milestone triggers, lacks anti-repetition memory and burst throttling, has no action buttons or dynamic duration calculation, and the OpenRouter server function uses generic roast prompts without the store's calibrated satirical tone guide or a seamless fallback to the standalone rule catalog.

This design establishes a unified roast architecture:
1. An offline, deterministic catalog (`src/lib/roasts.ts`) containing the full 16 events, specificity rules, weighted variants, and dynamic stings.
2. An intelligent dispatch and session anti-repetition engine managing cooldowns, priority queues, burst aggregation, and localized interpolation.
3. Enhanced comic speech bubble UI supporting contextual micro-actions, dynamic duration, hover pause, Esc/swipe dismiss, entrance shake, and accessible ARIA roles.
4. Calibrated OpenRouter AI generation prompted with the exact tone guidelines and action context, enforced 1.5s timeout, output validation, and instant fallback to the catalog.

## Goals / Non-Goals

**Goals:**
- Provide a centralized bilingual catalog of at least 16 store events with priority tiers (P1, P2, P3), ordered specificity rules, and at least 8 stings.
- Support 3 intensity levels (`educado`, `normal`, `impiedoso`) with stings active only in ruthless mode after 3 actions.
- Enforce strict anti-repetition: max 2 displays per variant per session, no repeating the last 2 shown variants of a rule, and cooldowns of 4s (P2) and 10s (P3).
- Aggregate actions occurring within 600ms into a single humorous burst toast.
- Calculate dynamic duration: base 6s + 40ms per character exceeding 80 characters (max 12s), paused on hover/focus.
- Calibrate OpenRouter prompts using the tone guide (mock habit not person, real data, no emojis, dry irony, "você"), enforcing a 1.5s timeout, ≤140 char validation, session caching by `event + rule`, and seamless catalog fallback.

**Non-Goals:**
- Inline form validation errors remain inline; toasts do not replace form error states.
- Persisting roast session history across different browser sessions or devices (session-scoped memory via `sessionStorage` is sufficient).

## Decisions

### Decision 1: Structured Catalog Schema with Localized Text & Specificity Rules
- **Choice**: Structure `ROASTS` in `src/lib/roasts.ts` by event key. Each event specifies `priority` (1, 2, or 3) and an array of `rules` ordered from most specific to generic. Each rule contains `id`, `when: (ctx) => boolean`, `levels: IntensityLevel[]`, and `variants: Variant[]`. Each variant specifies `w` (relative weight), `sfx: { pt, en }`, `msg: { pt, en }`, and optional `action: { label: { pt, en }, onClick: (ctx) => void }`.
- **Rationale**: Aligns with Section 11 of the specification, ensures high maintainability, allows deterministic execution offline, and provides structured few-shot examples for LLM prompt calibration.
- **Alternatives Considered**: Flat string maps (cannot express rich contextual logic like "4 Russian authors in cart"); separate language files (prone to tone desynchronization between PT and EN).

### Decision 2: Session-Scoped Anti-Repetition and Cadence State
- **Choice**: Maintain runtime state in `sessionStorage` under key `del_roast_state` with schema:
  ```ts
  interface RoastSessionState {
    lastRuleByEvent: Record<string, string>;
    recentVariants: Record<string, number[]>; // ruleId -> last 2 indices
    shownCount: Record<string, number>; // variantKey -> count (max 2)
    lastShownAt: Record<string, number>; // event -> timestamp
    actions: number;
    lastStingIndex?: number;
    aiCache: Record<string, { sfx: string; msg: string; action?: any }>;
  }
  ```
  Provide in-memory fallback if `sessionStorage` is restricted or during SSR.
- **Rationale**: Meets acceptance criteria ("same action 5 times does not show same phrase twice", "each variant max 2x per session", "P2 4s and P3 10s cooldown").
- **Alternatives Considered**: In-memory React state (resets on full-page navigations); LocalStorage (persists forever across sessions, which could permanently exhaust variants).

### Decision 3: Two-Tier Generation Architecture (AI Primary, Instant Deterministic Fallback)
- **Choice**:
  ```
  [Event Dispatched]
         │
         ▼
  [Check Cooldown & Burst (<600ms)]
         │
         ▼
  [Check Session AI Cache (event + rule)] ──(Hit)──► [Display Toast]
         │ (Miss)
         ▼
  [Has API Key & Online?]
     ├── No ──────────────────────────────────────┐
     └── Yes ──► [OpenRouter Call (1.5s Timeout)]  │
                     │                            │
             (Success & Valid)             (Timeout/Error)
                     │                            │
                     ▼                            ▼
             [Cache in Session]           [Evaluate Catalog Rule]
                     │                            │
                     └─────────────┬──────────────┘
                                   │
                                   ▼
                           [Display Toast]
  ```
- **Rationale**: Guarantee zero UI lag for users regardless of external AI network conditions while preserving AI-driven novelty when available.
- **Alternatives Considered**: Blocking UI on AI generation without timeout (causes unacceptable layout freeze or delayed feedback).

### Decision 4: Enhanced Comic Toast UI Components
- **Choice**: Extend `<ComicToast />` to accept:
  - `action`: optional button (`sm secondary`, max 18 chars).
  - Dynamic duration calculation computed in `showRoastToast()`.
  - Pause-on-hover / pause-on-focus event listeners.
  - Global `Esc` keyboard listener and touch swipe-right handler.
  - Onomatopoeia shake CSS keyframe (`del-shake`: rotate 2deg for 200ms) and exit animation (`del-toast-exit`: fade + translate 12px right).
  - Dynamic `role="alert"` for P1 errors vs `role="status"` for normal toasts.
- **Rationale**: Implements sections 2, 7, 8, and 9 of the specification faithfully while maintaining neo-brutalist comic aesthetic.

## Risks / Trade-offs

- **[Risk] OpenRouter API latency exceeding user attention span**
  → *Mitigation*: Hard 1.5s timeout via `AbortSignal`. If inference doesn't resolve within 1,500ms, the system falls back immediately to the deterministic catalog.
- **[Risk] Rapid consecutive user clicks causing toast avalanche**
  → *Mitigation*: 600ms debounce/burst aggregator collapses multiple rapid actions into a single aggregate toast ("3 livros de uma vez. Ambicioso.").
- **[Risk] Screen reader verbosity on repeated letters in SFX (e.g., "BIIIP", "CABRUM")**
  → *Mitigation*: Provide normalized `aria-label` on SFX elements for assistive technologies.
- **[Risk] Missing interpolation parameters causing `{undefined}` tokens**
  → *Mitigation*: Strict interpolation helper with fallbacks and type-safe context formatting based on active locale.

## Migration Plan

1. **Phase 1: Catalog & Engine**: Implement `src/lib/roasts.ts` with all 16 events, rules, variants, stings, formatting helpers, and the selection algorithm.
2. **Phase 2: Toast UI & Motion**: Update `src/components/ui/comic-toast.tsx` and `src/lib/roast-toast.tsx` to support actions, hover pause, dynamic duration, swipe/Esc dismiss, and accessibility attributes.
3. **Phase 3: Server AI Calibration**: Refactor `src/lib/server/roast.ts` with the new tone guidelines, 1.5s timeout, validation, AI caching, and fallback connection to `roasts.ts`.
4. **Phase 4: Store Event Dispatching**: Connect all shopping actions (cart add/remove/re-add, checkout, pix copy/expire, card decline, login, delivery stage, idle timer) to the roast dispatcher.
5. **Phase 5: Verification**: Run automated tests and Playwright scenarios confirming anti-repetition, 140-char limits, bilingual formatting, and fallback behavior.

## Open Questions

- *Idle Timer Duration*: Spec specifies 90 seconds of inactivity to trigger an `idle` toast. The idle listener will be attached to global window user activity (pointermove, keydown, scroll) and only fire if the user is on a book or catalog page.
