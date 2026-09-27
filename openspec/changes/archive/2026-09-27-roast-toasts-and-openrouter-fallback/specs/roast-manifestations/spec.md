## ADDED Requirements

### Requirement: Event Dispatching and Priority Catalog
The application SHALL support a centralized roast manifestation event catalog covering at least 16 distinct store lifecycle events categorized into three priority tiers (P1: critical/always shown; P2: subject to standard cooldown; P3: low priority, shown only when queue is clear). The catalog SHALL cover: `book-added` (P2), `book-readded` (P1), `cart-opened` (P3), `checkout-started` (P2), `login-required` (P1), `login` (P2), `wish-added` (P3), `review-posted` (P2), `pix-copied` (P3), `pix-expired` (P1), `card-declined` (P1), `purchase-completed` (P1), `delivery-stage` (P2), `delivered` (P1), `idle` (P3, triggered after 90 seconds without user interaction), and `cart-removed` (P3).

#### Scenario: Dispatching high-priority event
- **WHEN** a user card payment is declined (`card-declined`) or Pix expires (`pix-expired`)
- **THEN** the manifestation engine treats the event as P1 and immediately displays the toast regardless of background cooldowns

#### Scenario: Dispatching low-priority event under load
- **WHEN** a low-priority P3 event (such as `cart-opened` or `wish-added`) triggers while a previous toast is within its 10-second cooldown
- **THEN** the manifestation engine suppresses the toast to prevent interface clutter

### Requirement: Rule Evaluation and Specificity Ordering
Each catalog event SHALL contain an ordered list of candidate rules from most specific to generic fallback. The evaluation engine SHALL filter rules matching the active action context condition (`when(ctx) === true`) and permitted under the active user intensity level (`educado`, `normal`, `impiedoso`). The engine SHALL select the first matching rule, skipping the immediately previous rule used for that event whenever an alternative matching rule exists.

#### Scenario: Specific rule prioritization
- **WHEN** a user adds a book with 1,024 pages to their cart
- **THEN** the manifestation engine prioritizes the `huge-book` rule over the `generic` rule and selects an appropriate specific variant

#### Scenario: Avoiding consecutive identical rule triggers
- **WHEN** a user performs an action that matches rule A twice in succession, and alternative matching rule B is available
- **THEN** the engine selects rule B for the second execution to preserve novelty

### Requirement: Intensity Levels and Dynamic Stings
The manifestation engine SHALL support three configurable intensity levels: `educado`, `normal` (default), and `impiedoso`. In `educado` mode, the engine SHALL only select variants that cite specific factual data and MUST NOT select variants marked exclusively for `normal` or `impiedoso`, nor append stings. In `impiedoso` mode, whenever the cumulative session action counter exceeds 3, the engine SHALL append a randomly selected stinging remark (`sting`) from an offline pool of at least 8 stings without repeating the immediately previous sting.

#### Scenario: Polite level suppresses insults and stings
- **WHEN** the intensity level is set to `educado`
- **THEN** the engine only selects variants approved for `educado`, formats the message using factual numbers, and never appends a stinging tailphrase

#### Scenario: Ruthless level appends sting after three actions
- **WHEN** the intensity level is set to `impiedoso` and the user performs their 4th store action
- **THEN** the generated message appends a sting (e.g., "Estou anotando." / "I’m taking notes.") chosen without repeating the previous sting

### Requirement: Session Anti-Repetition and Cadence Control
The manifestation engine SHALL track runtime state in `sessionStorage` containing the last rule used per event, recent variant indices per rule, total times each variant was shown, last shown timestamp per event, and total user action count. The engine SHALL enforce that:
1. The exact same variant does not repeat across the last 2 displays of that rule.
2. Each variant appears at most 2 times per session, downgrading to an unexhausted variant or generic rule thereafter.
3. Cooldown between occurrences of the same event is 4 seconds for P2 and 10 seconds for P3.
4. Actions triggered within 600ms of each other are aggregated into a single burst toast.

#### Scenario: Anti-repetition across repeated identical actions
- **WHEN** a user adds books repeatedly 5 times in a single session
- **THEN** the manifestation engine never presents the same roast message twice in succession and exhausts variants according to session limits

#### Scenario: Rapid burst aggregation
- **WHEN** a user clicks to add 3 books within a 500ms window
- **THEN** the engine aggregates the events into a single toast commenting on the rapid burst rather than firing 3 separate notifications

### Requirement: Localized Context Interpolation
All toast text variants SHALL define both Portuguese (`pt`) and English (`en`) copy with matched comedic tone rather than literal translation. The interpolation engine SHALL replace placeholders (`{pages}`, `{total}`, `{hours}`, `{title}`, `{author}`, `{n}`, `{name}`) formatted according to the active locale at dispatch time (e.g., Brazilian thousands separator `1.024` and currency `R$ 119,90` versus English `1,024` and `$23.98`). Existing toasts on screen SHALL NOT mutate if the user switches languages while they remain visible.

#### Scenario: Formatting numbers according to Portuguese locale
- **WHEN** a roast message containing `{pages}` and `{total}` is triggered with locale `pt`
- **THEN** 1024 is formatted as `"1.024"` and 59.9 is formatted as `"R$ 59,90"`

#### Scenario: Preserving on-screen toast copy during language change
- **WHEN** a toast is currently visible on screen in Portuguese and the user switches the storefront to English
- **THEN** the visible toast retains its Portuguese text while subsequent toasts appear in English

### Requirement: Offline Catalog Content Completeness
The application SHALL bundle an offline roast catalog in `src/lib/roasts.ts` satisfying minimum content thresholds: at least 3 variants per rule, at least 5 variants for the generic rule of each event, at least 8 bilingual stings, at least 6 variants for card declined (`card-declined`), at least 3 variants for Pix expired (`pix-expired`), and at least 2 variants per delivery tracking stage (`delivery-stage`). Every variant message SHALL not exceed 140 characters after placeholder interpolation.

#### Scenario: Offline catalog fallback availability
- **WHEN** any event is dispatched while offline or without external API connectivity
- **THEN** the manifestation engine immediately resolves a valid sound effect (`sfx`) and message (`msg`) of at most 140 characters satisfying all tone guidelines
