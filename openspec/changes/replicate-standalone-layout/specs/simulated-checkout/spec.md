## MODIFIED Requirements

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
