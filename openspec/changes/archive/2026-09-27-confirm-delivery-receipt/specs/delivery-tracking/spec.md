## ADDED Requirements

### Requirement: Order delivery receipt confirmation
The delivery tracking view SHALL provide an interactive purchase receipt confirmation control whenever an order reaches the terminal `"Entregue"` delivery stage and has not yet been confirmed by the user. The confirmation control SHALL present a clear prompt asking the user to confirm receipt of their books and a prominent `"Confirmar recebimento da compra"` action button.
Upon clicking the confirmation button, the application SHALL persist `receiptConfirmed: true` and the current timestamp (`confirmedReceiptAt`) onto the order in local state. The tracking UI SHALL immediately update the delivery card to display a `"RECEBIMENTO CONFIRMADO"` comic stamp with the confirmation timestamp and satirical commentary.
The application SHALL also trigger a dedicated satirical roast toast notification on confirmation.
In the order history view (`/orders`), orders with confirmed receipt SHALL display a receipt confirmation badge alongside the terminal delivery stage indicator.

#### Scenario: Prompt user to confirm purchase receipt upon delivery
- **WHEN** an order is in the `"Entregue"` stage and `receiptConfirmed` is falsy
- **THEN** the tracking page displays an interactive card asking the user to confirm receipt with a `"Confirmar recebimento da compra"` button

#### Scenario: User confirms delivery receipt
- **WHEN** the visitor clicks `"Confirmar recebimento da compra"`
- **THEN** the order state is updated with `receiptConfirmed: true` and `confirmedReceiptAt` ISO timestamp
- **AND** the tracking UI replaces the action button with a `"RECEBIMENTO CONFIRMADO"` comic stamp and the confirmation timestamp
- **AND** a satirical roast toast notification with onomatopoeia is displayed

#### Scenario: Display receipt confirmation in order history
- **WHEN** a visitor views `/orders` and an order has `receiptConfirmed: true`
- **THEN** the order card displays a confirmed receipt badge alongside the `"Entregue"` stage badge
