## MODIFIED Requirements

### Requirement: Contextual humorous feedback
The application SHALL show short, dismissible feedback after meaningful actions such as adding a book, saving a wish, posting a review, or completing an order. Feedback SHALL not prevent the action or obscure essential controls. In addition to local instant notifications, the application SHALL trigger AI roast milestone evaluations on high-impact moments (cart crossing 3+ items, cart exceeding 1,000 pages, wishlist exceeding 1,000 or 2,000 pages, opening checkout, completing a simulated order, or every 3 exploratory search and filter adjustments including text query, genre, price, author, and length) displaying punchy acidic commentary that references the active parameter changed.

#### Scenario: Add a book
- **WHEN** a visitor adds a book to the cart
- **THEN** the cart updates and a contextual message can be dismissed without changing the cart

#### Scenario: Milestone AI roast trigger
- **WHEN** a visitor action causes their cart to cross 3+ books, exceed 1,000 pages, navigate to checkout, or complete an order
- **THEN** an AI roast milestone toast appears with an uppercase sound-effect tag and acidic comedy commentary, falling back gracefully if inference is slow or offline

#### Scenario: Wishlist pages milestone AI roast trigger
- **WHEN** saving a book to the wishlist causes total wishlist pages to cross 1,000 or 2,000 pages
- **THEN** an AI roast milestone toast appears with an uppercase sound-effect tag mocking wishlist accumulation, falling back gracefully if inference is slow or offline

#### Scenario: Unified search and filter cadence AI roast trigger
- **WHEN** a visitor performs any combination of catalog search or filter changes (query, genre, price, author, length) reaching a multiple of 3 exploratory actions (3, 6, 9...)
- **THEN** an AI roast milestone toast appears referencing the specific parameter and value that was modified during that 3rd action, falling back gracefully if inference is slow or offline
