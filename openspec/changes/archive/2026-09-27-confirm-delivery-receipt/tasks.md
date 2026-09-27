## 1. Store & Data Model

- [x] 1.1 Extend `Order` type in `src/lib/store.ts` with `receiptConfirmed?: boolean` and `confirmedReceiptAt?: string`.
- [x] 1.2 Implement `confirmOrderReceipt(orderId: string)` action in `useStore` to update and persist the order's receipt confirmation.

## 2. Satirical Roasts & Translations

- [x] 2.1 Add `dispatchDeliveryReceiptConfirmed` event trigger in `src/lib/roast-trigger.ts` and comedic fallback quotes in `src/lib/roast-fallbacks.ts`.
- [x] 2.2 Add bilingual (PT-BR and EN) i18n keys for confirmation prompt, CTA button, confirmed receipt stamp, and timestamp formatting in `src/lib/i18n.ts`.

## 3. Delivery Tracking & Orders UI

- [x] 3.1 Add interactive receipt confirmation prompt and confirmed stamp view to the terminal stage in `src/routes/orders_.$orderId.tracking.tsx`.
- [x] 3.2 Add confirmed receipt badge in `src/routes/orders.tsx` for delivered orders with confirmed receipt.

## 4. Verification & Testing

- [x] 4.1 Add Playwright e2e test cases in `tests/delivery.spec.ts` verifying receipt confirmation button interaction, status stamp, and state persistence across page reload.
- [x] 4.2 Run `pnpm check`, `pnpm build`, and tests to verify type safety and test passes.
