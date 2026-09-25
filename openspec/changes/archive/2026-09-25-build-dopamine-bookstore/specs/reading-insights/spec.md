## ADDED Requirements

### Requirement: Derived fictional shopping statistics
The application SHALL calculate insights from completed local orders, including total pretend spend, book count, accumulated pages, estimated reading hours, favorite genre, and average book length. It SHALL distinguish these values from actual reading progress or spending.

#### Scenario: No orders
- **WHEN** a visitor opens statistics before completing an order
- **THEN** zero or empty values appear with an invitation to explore the catalog

#### Scenario: Orders exist
- **WHEN** a visitor completes one or more orders and opens statistics
- **THEN** the displayed values reflect the saved order contents and remain consistent after reload

### Requirement: Contextual humorous feedback
The application SHALL show short, dismissible feedback after meaningful actions such as adding a book, saving a wish, posting a review, or completing an order. Feedback SHALL not prevent the action or obscure essential controls.

#### Scenario: Add a book
- **WHEN** a visitor adds a book to the cart
- **THEN** the cart updates and a contextual message can be dismissed without changing the cart

