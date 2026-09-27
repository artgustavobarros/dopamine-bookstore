## Why

Currently, the simulated delivery tracking page (`/orders/$orderId/tracking`) automatically progresses to the 7th stage ("Entregue") and displays the celebratory "ENTREGUE!" stamp card, but lacks an interactive prompt for the user to confirm the purchase receipt. In real-world e-commerce and logistics workflows, customers explicitly confirm that the order was received and matches their purchase. Adding an interactive "Confirmar recebimento da compra" action closes the simulated post-purchase loop, provides closure to the delivery journey, triggers a satirical roast about finally facing the purchased pile, and records the confirmation status in the order history.

## What Changes

- **User Delivery Receipt Confirmation Action**:
  - Add an interactive confirmation card and primary action button ("Confirmar recebimento da compra" / "Confirm delivery receipt") to the delivery tracking page (`/orders/$orderId/tracking`) when the delivery reaches the terminal "Entregue" stage.
  - Persist confirmation state (`receiptConfirmed: boolean`, `confirmedReceiptAt?: string`) on the `Order` entity in `useStore`.
- **Post-Confirmation UI State & Comic Stamp**:
  - Once the user confirms receipt, transition the delivery tracking status card to show a neo-brutalist stamp ("RECEBIMENTO CONFIRMADO" / "RECEIPT CONFIRMED") with the confirmation timestamp.
  - Provide a satirical post-confirmation feedback prompt acknowledging that the books are officially in their hands and the pile can no longer be ignored.
- **Satirical Roast on Confirmation**:
  - Dispatch a specialized comic roast toast when the user confirms receipt (e.g., with onomatopoeia `CONFERIDO!` / `OFFICIAL!` celebrating the end of excuses).
- **Orders List Badge Integration**:
  - In `/orders`, display an indicator/badge on orders with confirmed receipt (e.g. "✓ Recebimento confirmado") alongside the delivered stage tag.
- **Bilingual I18n**:
  - Add English and Portuguese translation keys for receipt confirmation buttons, stamps, feedback texts, and roast triggers in `src/lib/i18n.ts`.

## Capabilities

### Modified Capabilities
- `delivery-tracking`: Add delivery receipt confirmation requirement and post-delivery confirmation state to the delivery tracking experience when stage is "Entregue".

## Impact

- **Affected Routes & Components**:
  - `src/routes/orders_.$orderId.tracking.tsx` (delivery tracking page: add receipt confirmation action and confirmed view state)
  - `src/routes/orders.tsx` (orders history: reflect confirmed receipt status)
- **State & Logic**:
  - `src/lib/store.ts` (extend `Order` type and add `confirmOrderReceipt` store action)
  - `src/lib/roast-trigger.ts` & `src/lib/roasts.ts` / `src/lib/server/roast.ts` (new delivery confirmation roast event / toast)
  - `src/lib/i18n.ts` (bilingual strings for confirmation flow)
- **Tests**:
  - `tests/delivery.spec.ts` (e2e and unit tests for confirming receipt on delivered orders)
