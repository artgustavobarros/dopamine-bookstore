## MODIFIED Requirements

### Requirement: Contextual humorous feedback
The application SHALL show short, dismissible feedback after meaningful actions such as adding a book, saving a wish, posting a review, or completing an order. Feedback SHALL not prevent the action or obscure essential controls. In addition to local instant notifications, the application SHALL trigger AI roast milestone evaluations on high-impact moments (cart crossing 3+ items, cart exceeding 1,000 pages, wishlist exceeding 1,000 or 2,000 pages, switching catalog categories more than 3 times, executing more than 3 searches, opening checkout, or completing a simulated order) displaying punchy acidic commentary.

#### Scenario: Add a book
- **WHEN** a visitor adds a book to the cart
- **THEN** the cart updates and a contextual message can be dismissed without changing the cart

#### Scenario: Milestone AI roast trigger
- **WHEN** a visitor action causes their cart to cross 3+ books, exceed 1,000 pages, navigate to checkout, or complete an order
- **THEN** an AI roast milestone toast appears with an uppercase sound-effect tag and acidic comedy commentary, falling back gracefully if inference is slow or offline

#### Scenario: Wishlist pages milestone AI roast trigger
- **WHEN** saving a book to the wishlist causes total wishlist pages to cross 1,000 or 2,000 pages
- **THEN** an AI roast milestone toast appears with an uppercase sound-effect tag mocking wishlist accumulation, falling back gracefully if inference is slow or offline

#### Scenario: Category hopping indecision AI roast trigger
- **WHEN** a visitor switches catalog category filters more than 3 times in a browsing session
- **THEN** an AI roast milestone toast appears mocking literary indecision and genre browsing commitment issues

#### Scenario: Search iteration indecision AI roast trigger
- **WHEN** a visitor executes more than 3 catalog search queries in a browsing session
- **THEN** an AI roast milestone toast appears mocking endless searching without committing to a book
