## Why

"Depois Eu Leio" (*Dopamine Bookstore*) satires reader procrastination (*tsundoku*), the dopamine rush of accumulating books, and perpetual indecision. While the cart already features AI roast toasts when crossing book count and page milestones, two major procrastinator behaviors currently lack comedic feedback:
1. **Endless Wishlist Hoarding**: Users hoarding hundreds or thousands of unread pages in their wishlist ("saving to pretend they will buy and read later") receive only a generic static toast.
2. **Analysis Paralysis & Restless Browsing**: Users jumping between genres more than 3 times or running more than 3 searches without committing to a single book display classic literary commitment phobia.

Adding milestone toasts for 1,000 and 2,000 wishlist pages, as well as browsing and search indecision, reinforces the satirical premise of the store across the core discovery journey.

## What Changes

- **Wishlist Pages Milestone Toasts**: Detect when a book added to the wishlist causes total wishlist pages to cross 1,000 or 2,000 pages, triggering a custom comedic roast toast with uppercase sound-effect tags (e.g. `[CEMITÉRIO DE DESEJOS]`, `[ILUSÃO PURA]`).
- **Category Switch Indecision Roast**: Track genre/category changes in catalog discovery and trigger an AI roast toast upon switching categories more than 3 times in a session (e.g. `[INDECISÃO CRÔNICA]`, `[TURISTA LITERÁRIO]`).
- **Search Iteration Indecision Roast**: Track search queries and trigger an AI roast toast upon submitting or executing more than 3 distinct searches in a session (e.g. `[BUSCA INFINITA]`, `[PARALISIA DE ESCOLHA]`).
- **Extended Roast Prompt & Fallbacks**: Expand `server/roast.ts` and `roast-fallbacks.ts` with new event types (`wishlist_milestone_pages`, `category_switch_milestone`, `search_milestone`), prompt contextualization, and deterministic bilingual fallbacks (`pt` and `en`).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `reading-insights`: Add milestone roast triggers for wishlist accumulated pages (1,000 and 2,000 pages), category hopping (>3 switches), and repetitive catalog searching (>3 queries).
- `ai-roast-generator`: Add support for `wishlist_milestone_pages`, `category_switch_milestone`, and `search_milestone` event types in prompt engineering, schema validation, and fallback libraries.

## Impact

- `src/lib/server/roast.ts`: Extend `roastInputSchema` to accept new events and browsing metrics (`categorySwitches`, `searchCount`, `genreFrom`, `genreTo`, `query`); update prompt builders for PT/EN.
- `src/lib/roast-fallbacks.ts`: Add fallback punchlines and tags for the new events in PT and EN.
- `src/lib/roast-trigger.ts`: Add helper functions or extend wishlist and browsing trigger handlers with milestone tracking.
- `src/components/store/book-card.tsx` & `src/routes/books/$bookId.tsx`: Wire wishlist milestone check when saving a book to wishlist.
- `src/routes/index.tsx`: Track category switches and search submission counters, triggering the respective indecision roast toasts once thresholds are crossed.
