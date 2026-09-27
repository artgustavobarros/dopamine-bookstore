## MODIFIED Requirements

### Requirement: Local order confirmation
Confirming a fictional purchase SHALL create one local order with a stable ID, timestamp, selected books, displayed subtotal, page total, pretend method, delivery address details, and an initial stage skew of zero, then clear the cart and show a confirmation page. The confirmation page SHALL feature a blue hero banner with halftones, an angled order code stamp, four post-purchase metrics (unspent money, pages added to conscience, estimated reading hours, and books likely to stay on the shelf), and a primary `"Acompanhar entrega →"` CTA linking directly to the delivery tracking route.

#### Scenario: Confirm order
- **WHEN** a visitor confirms a nonempty checkout
- **THEN** one order is saved, the cart becomes empty, and the confirmation page displays the blue hero card, zero real charge, the 4 reading metrics, and the `"Acompanhar entrega →"` tracking link

### Requirement: Order history
The application SHALL list locally saved orders in reverse chronological order with their date, items, subtotal, and reading totals. Each order card SHALL display its current simulated delivery stage badge using one of four neo-brutalist stage color codes (Stages 1–3 Yellow, 4–5 Blue, 6 Red, 7 Green), a live mini delivery progress bar, and an `"Acompanhar entrega →"` button navigating to that order's tracking view. It SHALL show a helpful empty state when no orders exist.

#### Scenario: Return to previous orders
- **WHEN** a visitor completes an order, leaves, and later opens order history
- **THEN** the saved order is visible after reload with its active stage status badge, mini progress bar, and tracking link
