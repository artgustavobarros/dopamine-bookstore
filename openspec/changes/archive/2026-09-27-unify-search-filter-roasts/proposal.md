## Why

Visitors browsing the catalog encounter an inert, confusing "Gênero" element placed right beside the search bar that looks like a button but does nothing, while actual genre filter buttons already exist below it. Furthermore, the previous browsing roast milestones only triggered once after 3 text searches or 3 category switches separately, ignoring other exploration filters (price, author, length) and lacking context on what parameter was being altered. As requested, all search and filter parameter changes (genre, price, author, length, and text queries) must be unified into a recurring cadence of every 3 interactions, passing the active parameter and its value into the roast prompt and fallback toasts so the satire specifically mocks what the user just tweaked.

## What Changes

- **UI Cleanup in Catalog Search**: Remove the decorative, non-interactive `<div>` labeled `text.genre` with `<SlidersHorizontal />` next to the search input in `src/routes/index.tsx`, allowing the search input to span cleanly and eliminating user confusion.
- **Unified Exploration Counter & Repeating Cadence**: Combine text searches and filter adjustments (`genre`, `price`, `author`, `length`) into a single exploration counter in the catalog. Trigger a roast on every 3rd interaction (at 3, 6, 9, etc.), rather than a one-time check after 3 actions.
- **Contextual Parameter Roast Generation**: Pass the active interaction type (`query`, `genre`, `price`, `author`, `length`), the new parameter value, and previous value (when applicable) to `generateRoastFn` and `getSearchFilterFallback`.
- **Targeted Comedy Satire & Fallbacks**: Update the OpenRouter roast master prompt and deterministic fallbacks to craft punchlines tailored to the exact parameter being changed (e.g., bargain-hunting for books they won't read with price filters, pretending to be an intellectual with author filters, intimidating page counts or deceptive short reads with length filters, chronic indecision with genre switches, or paralysis with query searches).
- **Automated Test Coverage**: Update end-to-end storefront tests to verify the removal of the inert genre badge, the unified cadence across mixed parameter adjustments, and the parameter-aware roast messages.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `catalog-discovery`: Remove the inert genre button element adjacent to the catalog search input; preserve interactive genre selection buttons in the dedicated genre row.
- `reading-insights`: Update browsing roast triggers so that any search or filter modification (genre, price, author, length, query) counts as an exploration action, triggering a roast every 3 actions with the parameter context.
- `ai-roast-generator`: Extend the roast schema and prompt to accept exploration parameter references (`filterType`, `filterValue`, `previousValue`) and produce contextual roasts mocking the specific parameter tweaked.

## Impact

- **UI**: `src/routes/index.tsx` removes the inert `SlidersHorizontal` element next to the search bar.
- **State & Logic**: `src/routes/index.tsx` and `src/lib/roast-trigger.ts` replace separate one-off refs with a unified exploration counter firing every 3 actions.
- **API & Server**: `src/lib/server/roast.ts` updates `roastInputSchema` and prompt generation to handle parameter references.
- **Fallbacks**: `src/lib/roast-fallbacks.ts` adds parameter-aware deterministic fallbacks for query, genre, price, author, and length.
- **Tests**: `tests/storefront.spec.ts` updates assertions to reflect the unified cadence and parameter references.
