# simulated-checkout Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Explicitly fictional checkout
The application SHALL provide a checkout for a nonempty cart that clearly states no money is charged. It SHALL let the visitor choose a pretend method and confirm the order without requesting a password, address, card number, or usable Pix payment data.

#### Scenario: Start checkout with items
- **WHEN** a visitor with cart items and a demo profile opens checkout
- **THEN** the page shows the order summary, a no-charge notice, pretend method choices, and a confirmation action

#### Scenario: Start checkout without identity
- **WHEN** a visitor with cart items but no demo profile tries to check out
- **THEN** the application directs them to the demo identity form and returns them to checkout after valid submission

#### Scenario: Empty cart checkout
- **WHEN** a visitor opens checkout with an empty cart
- **THEN** the application shows an empty-cart state and does not create an order

### Requirement: Local order confirmation
Confirming a fictional purchase SHALL create one local order with a stable ID, timestamp, selected books, displayed subtotal, page total, and pretend method, then clear the cart and show a confirmation page.

#### Scenario: Confirm order
- **WHEN** a visitor confirms a nonempty checkout
- **THEN** one order is saved, the cart becomes empty, and the confirmation page states the real charge is zero

### Requirement: Order history
The application SHALL list locally saved orders in reverse chronological order with their date, items, subtotal, and reading totals. It SHALL show a helpful empty state when no orders exist.

#### Scenario: Return to previous orders
- **WHEN** a visitor completes an order, leaves, and later opens order history
- **THEN** the saved order is visible after reload

