# reading-insights Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Derived fictional shopping statistics
The application SHALL calculate insights from completed local orders, including total pretend spend, book count, accumulated pages, estimated reading hours, favorite genre, and average book length. It SHALL distinguish these values from actual reading progress or spending.

#### Scenario: No orders
- **WHEN** a visitor opens statistics before completing an order
- **THEN** zero or empty values appear with an invitation to explore the catalog

#### Scenario: Orders exist
- **WHEN** a visitor completes one or more orders and opens statistics
- **THEN** the displayed values reflect the saved order contents and remain consistent after reload

### Requirement: Contextual humorous feedback
The application SHALL show short, dismissible feedback after meaningful actions such as adding a book, saving a wish, posting a review, or completing an order. Feedback SHALL not prevent the action or obscure essential controls. In addition to local instant notifications, the application SHALL trigger AI roast milestone evaluations on high-impact moments (cart crossing 3+ items, cart exceeding 1,000 pages, opening checkout, or completing a simulated order) displaying punchy acidic commentary.

#### Scenario: Add a book
- **WHEN** a visitor adds a book to the cart
- **THEN** the cart updates and a contextual message can be dismissed without changing the cart

#### Scenario: Milestone AI roast trigger
- **WHEN** a visitor action causes their cart to cross 3+ books, exceed 1,000 pages, navigate to checkout, or complete an order
- **THEN** an AI roast milestone toast appears with an uppercase sound-effect tag and acidic comedy commentary, falling back gracefully if inference is slow or offline

### Requirement: Dedicated Reader Psychological Roast (Diagnóstico do Leitor)
The application SHALL provide a dedicated "Diagnóstico do Leitor" (Reader's Roast / Fritada Literária) card in the `/stats` route that analyzes the visitor's overall shopping habits, pretend spend, favorite genres, and unread book hoarding. The card SHALL offer an on-demand "Gerar Diagnóstico" / "Generate Roast" action with animated feedback and display a detailed roast summary.

#### Scenario: Initial state with no orders
- **WHEN** a visitor visits `/stats` before completing any simulated orders
- **THEN** the roast panel displays an invitation to first accumulate books or indulge in some questionable decisions

#### Scenario: On-demand psychological roast generation
- **WHEN** a visitor with simulated purchases clicks to generate their psychological evaluation
- **THEN** an animated analysis state is displayed while the server generates the roast, followed by the acidic psychological breakdown of their reading delusion

