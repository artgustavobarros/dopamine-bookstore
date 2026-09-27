## Context

The bookstore application simulates real-time package delivery across 7 stages with a 120-second timeline and a prototype acceleration button (`"Adiantar etapa →"`). While stage 7 marks the package as `"Entregue"`, there is currently no user-initiated closure action to confirm that the package was received. In e-commerce workflows, confirming delivery receipt is a standard step that closes the logistics cycle. In our satirical context, it serves as the moment the user officially acknowledges that the books have arrived and the excuses for not reading have run out.

## Goals / Non-Goals

**Goals:**
- Provide an interactive confirmation card on `/orders/$orderId/tracking` when the delivery reaches `"Entregue"`.
- Persist `receiptConfirmed: boolean` and `confirmedReceiptAt: string` on the `Order` model in Zustand store.
- Display a tactile neo-brutalist stamp (`"RECEBIMENTO CONFIRMADO"`) and confirmation timestamp once confirmed.
- Dispatch a comic roast notification with a dedicated onomatopoeia (`CONFERIDO!` / `OFFICIAL!`).
- Display a confirmation badge in the orders history list (`/orders`) for delivered and confirmed orders.
- Provide bilingual support (PT-BR and EN) for all new text and stamps.

**Non-Goals:**
- Requiring real signatures, photo uploads, or courier code verifications.
- Modifying the pre-delivery stages (stages 1 through 6 keep their timing, skew, and progression logic).
- Preventing the user from navigating or viewing other pages before confirming receipt.

## Decisions

### 1. Persist receipt confirmation fields on the `Order` entity in `useStore`
- **Choice**: Add optional fields `receiptConfirmed?: boolean` and `confirmedReceiptAt?: string` to `Order` in `src/lib/store.ts`, backed by a new action `confirmOrderReceipt(orderId: string): void`.
- **Rationale**: Keeps order state normalized, serializable, and backward-compatible with existing persisted orders in `localStorage`.
- **Alternative considered**: Storing confirmation in a separate component-level state or separate store slice. Rejected because receipt confirmation must persist across reloads and appear in `/orders`.

### 2. Present receipt confirmation in the terminal delivery stage
- **Choice**: Display the confirmation prompt in the tracking page aside column when `deliveryState.delivered` is true and `!order.receiptConfirmed`. When confirmed, swap the prompt for the confirmed receipt stamp and timestamp.
- **Rationale**: Integrates seamlessly with the existing delivery tracking layout right alongside the celebratory `"ENTREGUE!"` comic stamp card without cluttering the 7-stage vertical timeline.
- **Alternative considered**: Making receipt confirmation an 8th stage in the timeline. Rejected because standard shipping timelines end at "Entregue"; confirming receipt is a user action on the delivered order.

### 3. Dedicated roast toast event for receipt confirmation
- **Choice**: Add `dispatchDeliveryReceiptConfirmed` in `src/lib/roast-trigger.ts` with onomatopoeia `CONFERIDO!` (PT) and `OFFICIAL!` (EN), with satirical fallback messages about the newly formed pile of unread books.
- **Rationale**: Keeps consistent with our dopamine bookstore comic aesthetic and roast notification architecture.

## Risks / Trade-offs

- **Existing persisted orders in `localStorage`**:
  - *Risk*: Orders created before this change won't have `receiptConfirmed` defined.
  - *Mitigation*: Treat `undefined` as `false`. `Order` schema defines `receiptConfirmed?: boolean`.
- **Fast-forwarding via `"Adiantar etapa →"`**:
  - *Risk*: Users testing delivery acceleration might reach `"Entregue"` quickly and need to immediately test confirmation.
  - *Mitigation*: The confirmation card is instantly visible as soon as the order transitions to `"Entregue"` (whether through natural elapsed time or stage skipping).
