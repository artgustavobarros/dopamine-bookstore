## Context

"Depois Eu Leio" (*Dopamine Bookstore*) simulates the satirical psychological loop of buying books to acquire dopamine rather than reading. The existing system triggers AI roast toasts for cart milestones (crossing 3 or 6 items, crossing 1,000 or 2,000 pages), opening checkout, and completing orders.

However, readers frequently spend most of their time in the catalog indulging in procrastination behaviors:
- Stockpiling hundreds or thousands of unread pages in their wishlist (*lista de desejos*).
- Indecisively hopping across multiple genres without choosing anything.
- Repeatedly querying the catalog searching for an elusive title to justify their reading intentions.

This design introduces reactive AI roast toasts for these discovery and wishlist habits while maintaining fast responsiveness, zero API costs (OpenRouter free models), and resilient local fallbacks.

## Goals / Non-Goals

**Goals:**
- Trigger satirical AI roast toasts when the visitor's wishlist page count crosses 1,000 and 2,000 pages.
- Trigger satirical AI roast toasts when the visitor switches catalog categories more than 3 times in a session.
- Trigger satirical AI roast toasts when the visitor performs more than 3 distinct searches in a session.
- Keep the UI responsive: non-blocking server function invocations with a 2.5s timeout, falling back seamlessly to deterministic satirical copy if the model is slow or offline.
- Support bilingual prompts and outputs (`pt` and `en`).

**Non-Goals:**
- Toasting on every single category click or keystroke (only fire once when crossing the threshold >3 to avoid spamming).
- Changing wishlist or search data persistence models (browsing counters are session-based or component-managed).
- Interfering with normal bookmarking/filtering performance or screen reader announcements.

## Decisions

### 1. Dedicated `handleToggleWishWithMilestones` Trigger Function
- **Choice**: Create a dedicated helper `handleToggleWishWithMilestones` in `src/lib/roast-trigger.ts` mirrored after `handleAddBookWithMilestones`.
- **Rationale**: Keeps card and detail route components clean and ensures milestone calculation logic (inspecting prior wishlist pages vs. new wishlist pages) is centralized and testable.
- **Alternatives Considered**: Inlining inside `book-card.tsx` and `routes/books/$bookId.tsx` (would lead to duplicated threshold checking and maintenance drift).

### 2. Ephemeral Session Tracking for Catalog Indecision
- **Choice**: Track `categorySwitchCount` and `searchCount` in catalog route state / refs in `src/routes/index.tsx`.
- **Rationale**: Restless browsing and search loops are transient session behaviors. Resetting on reload or route remount is natural, and avoiding persistent storage prevents stale counters from firing toasts unexpectedly days later.
- **Alternatives Considered**: Storing switch counters in persisted Zustand store. Discarded because an indecision roast should reflect the immediate browsing session, not lifetime cumulative clicks.

### 3. Firing Guards for Browsing Milestones
- **Choice**: Guard category and search triggers with fired flags (`categoryRoastFired.current`, `searchRoastFired.current`).
- **Rationale**: The user asked for "ao trocar de categorias mais de 3 vezes, ou fazer mais de 3 pesquisas". Firing exactly on the threshold transition (>3, i.e., 4th switch or search) ensures the joke lands crisply once without becoming an annoying repetitive pop-up on every subsequent switch.

### 4. Schema & Prompt Extension in `server/roast.ts`
- **Choice**: Expand `roastInputSchema` with three new events:
  - `wishlist_milestone_pages`: captures `totalPages` and `cartCount` (wishlist count)
  - `category_switch_milestone`: captures `categorySwitches`, `genreTo`
  - `search_milestone`: captures `searchCount`, `query`
- **Prompt Engineering**: Provide targeted comedic guidelines:
  - Wishlist: Mocking the "graveyard of good intentions" and digital hoarding.
  - Category hopping: Mocking literary tourism, commitment phobia, and indecisiveness.
  - Search iteration: Mocking search paralysis and treating the search bar as a slot machine.

### 5. Curated Bilingual Fallbacks in `roast-fallbacks.ts`
- **Choice**: Add deterministic fallbacks with styled uppercase tags:
  - Wishlist: `[CEMITÉRIO DE DESEJOS]`, `[ILUSÃO DIGITAL]`, `[WISHLIST GRAVEYARD]`
  - Category switch: `[INDECISÃO CRÔNICA]`, `[TURISTA LITERÁRIO]`, `[COMMITMENT ISSUES]`
  - Search: `[BUSCA INFINITA]`, `[PARALISIA DE ESCOLHA]`, `[ENDLESS SEARCH]`

## Risks / Trade-offs

- **[Rapid typing triggering search roasts prematurely]** → Mitigation: Only increment the search counter when a search is executed/debounced with distinct non-empty values, not on every individual keystroke.
- **[Toast fatigue if multiple milestones trigger in rapid succession]** → Mitigation: Sonner automatically manages toast queueing and stacks; dismissal buttons are provided, and each browsing milestone fires at most once per session.
- **[OpenRouter latency / rate limit]** → Mitigation: Existing 2.5s `AbortController` and instant deterministic fallback catalog prevents any UI lockup.
