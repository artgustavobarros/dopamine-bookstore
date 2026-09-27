## Context

The storefront catalog currently features a non-interactive `<div>` element next to the search input styled with borders and a `<SlidersHorizontal />` icon with text `{text.genre}`. It serves no functional purpose, has no click handler, and confuses users because the interactive genre filter buttons are already rendered immediately below.

In addition, the previous roast implementation tracked category switches and search queries separately with hardcoded thresholds (`> 3`), ignoring other filter dimensions (`price`, `author`, `length`), and only fired once per session. The user specified that:
1. The non-functional genre button near search should be addressed.
2. All parameter changes (genre, price, author, length) and text searches must count together as exploration actions in a recurring cadence of every 3 actions ("a cada 3 buscas").
3. When triggering the roast, the system must pass and reference the exact parameter that was being changed so the comedic roast directly targets that parameter and its chosen value.

## Goals / Non-Goals

**Goals:**
- Remove the inert `SlidersHorizontal` "Gênero" element adjacent to the search input in `src/routes/index.tsx`.
- Unify search query submissions and filter changes (`genre`, `price`, `author`, `length`) into a single exploration counter.
- Trigger an AI roast toast on every 3rd exploration action (`explorationCount % 3 === 0`).
- Pass the changed parameter's details (`filterType`, `filterValue`, `filterPreviousValue`) to the roast generator.
- Update the OpenRouter roast master prompt and fallbacks to generate punchlines specifically mocking the changed parameter (price thriftiness, author name-dropping, page length excuses, genre tourism, or search paralysis).
- Update and enhance storefront tests in `tests/storefront.spec.ts`.

**Non-Goals:**
- Removing or altering the interactive genre filter pills below the search bar or the dropdown filters.
- Triggering roasts on every keystroke in the search bar (only completed searches via Enter / distinct query submission count).
- Changing remote Open Library fetching mechanisms.

## Decisions

### Decision 1: Remove the Inert Search-Bar Badge
- **Choice**: Eliminate `<div className="hidden ...">{text.genre}</div>` from `src/routes/index.tsx`.
- **Rationale**: The element has no event handler, is not an accessible button, duplicates the genre pills already located directly beneath the search input, and causes confusion. Removing it allows the search input to span cleanly.

### Decision 2: Unified Exploration Counter & Cadence
- **Choice**: Replace separate `categorySwitchCount` and `searchCount` refs with a unified `explorationCount = useRef(0)`.
- **Trigger Rule**: Whenever the visitor performs any of the following with a value different from the current filter:
  - Submits a search query (`filterType: "query"`)
  - Selects a genre (`filterType: "genre"`)
  - Selects a price band (`filterType: "price"`)
  - Selects an author (`filterType: "author"`)
  - Selects a length band (`filterType: "length"`)
  `explorationCount.current` increments by 1. If `explorationCount.current % 3 === 0`, trigger the roast!
- **Rationale**: Direct adherence to the user's requirement ("a cada 3 buscas, mudar parâmetros como gênero, preço, autor e tamanho também conta como busca").

### Decision 3: Parameter Context in Roast Schema & Functions
- **Choice**: Add `filterType`, `filterValue`, and `filterPreviousValue` to `roastInputSchema` in `src/lib/server/roast.ts` and `RoastContext` in `src/lib/roast-fallbacks.ts`.
- **Event Handling**: Support `event: "filter_search_milestone"` (or expand `search_milestone` / `category_switch_milestone`).
- **User Prompt Generation**: In `buildUserMessage(data: RoastContext)`:
  - If `filterType === "price"`: Mention that the user filtered by price to `filterValue` (mocking stinginess/bargain hunting for unread books).
  - If `filterType === "author"`: Mention filtering by author `filterValue` (mocking intellectual posturing and name-dropping).
  - If `filterType === "length"`: Mention filtering by book length `filterValue` (mocking delusions about finishing books based on page count).
  - If `filterType === "genre"`: Mention switching genre to `filterValue` from `filterPreviousValue` (mocking literary indecision).
  - If `filterType === "query"`: Mention searching for query `filterValue` (mocking search paralysis).

### Decision 4: Contextual Fallbacks
- **Choice**: Implement `getFilterSearchFallback(ctx, isEn)` in `src/lib/roast-fallbacks.ts` with dedicated tags and jokes for each `filterType`:
  - `price`: `[PECHINCHA INÚTIL]` / `[BARGAIN HUNTER]`
  - `author`: `[SÍNDROME DE INTELECTUAL]` / `[NAME DROPPER]`
  - `length`: `[ILUSÃO DE PÁGINAS]` / `[PAGE ILLUSION]`
  - `genre`: `[TURISTA LITERÁRIO]` / `[GENRE TOURIST]`
  - `query`: `[BUSCA INFINITA]` / `[SEARCH PARALYSIS]`

## Risks / Trade-offs

- **[Risk] High-frequency typing in search input triggering excessive counts** → *Mitigation*: The search query only increments the counter when the user presses Enter (`searchTerm` updates) or clears an active search, not on every keystroke in `filters.query`.
- **[Risk] Redundant filter selections (e.g. clicking the already active genre)** → *Mitigation*: Guard against no-op clicks by verifying `nextValue !== currentValue`.
- **[Risk] Fallback tone divergence from LLM output** → *Mitigation*: The fallbacks follow the exact same uppercase tag formatting and sardonic humor specified in the LLM roast master system prompt.
