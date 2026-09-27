# simulated-checkout Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Explicitly fictional checkout
The application SHALL provide a simulated checkout for a nonempty cart that clearly states no real currency is charged. It SHALL let the visitor select or fill a simulated delivery address (supporting auto-completion of Street, City, and State via ViaCEP upon typing an 8-digit CEP), and select from simulated payment options (Pix, Saved Card, New Credit Card, or None). When Credit Card is chosen, it SHALL provide an interactive visual card preview reflecting the detected brand, masked number, cardholder name, and expiry date. When Pix is chosen, it SHALL transition to a dedicated payment wait view with an animated 25x25 QR code matrix, a 60-second countdown timer, a color-shifting progress bar, a copy-code button, and a `"Simular leitura no celular"` prototype trigger.

#### Scenario: Address selection and ViaCEP auto-lookup in checkout
- **WHEN** a visitor types an 8-digit Brazilian CEP into the checkout address form
- **THEN** the application queries the ViaCEP API and auto-fills Street, City, and State fields without manual typing

#### Scenario: Interactive credit card preview and simulated decline
- **WHEN** a visitor enters credit card details in checkout
- **THEN** the interactive card component updates in real time with the detected card brand (Visa, Mastercard, Amex, Elo), formatted numbers, uppercase name, and expiry
- **AND** a simulated card decline rate triggers a satirical notification with probability 0.1, or completes the order

#### Scenario: Pix countdown and mobile scan simulation
- **WHEN** a visitor confirms a Pix checkout
- **THEN** a 60-second timer begins with a progress bar transitioning from yellow to red
- **AND** clicking `"Simular leitura no celular"` immediately marks the payment as approved with a `"PAGO!"` stamp and completes the order

#### Scenario: Empty cart checkout
- **WHEN** a visitor opens checkout with an empty cart
- **THEN** the application shows an empty-cart state and does not create an order

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

