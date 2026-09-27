## 1. Delivery Logic and Stages Expansion (8 Stages)

- [x] 1.1 Update `DELIVERY_STAGES` in `src/lib/delivery.ts` to define 8 stages: the 6 transit steps, step 7 as destination arrival awaiting confirmation, and step 8 as receipt confirmed.
- [x] 1.2 Update `calculateDeliveryState` in `src/lib/delivery.ts` to calculate progression out of 8 total steps, correctly accounting for `order.receiptConfirmed` to advance to step 8.
- [x] 1.3 Update `getStageColorClasses` in `src/lib/delivery.ts` so stage 7 returns the yellow palette (`bg-yellow`) and stage 8 returns the celebratory green palette (`bg-green`).

## 2. Localization & Copy

- [x] 2.1 Add Portuguese and English localized labels in `src/lib/i18n.ts` for "Aguardando confirmação" / "Awaiting confirmation", updated step titles, and step counter strings.

## 3. Order Tracking Screen UI & Button Fixes

- [x] 3.1 Fix the receipt confirmation button layout and typography in `src/routes/orders_.$orderId.tracking.tsx` using `whitespace-normal`, proper flex alignment, and balanced padding so the checkmark icon and label never clip or overflow.
- [x] 3.2 Update `OrderTrackingPage` hero banner in `src/routes/orders_.$orderId.tracking.tsx` to display yellow tone (`bg-yellow`) and "Etapa 7 de 8" while unconfirmed, switching to green (`bg-green`) and "Etapa 8 de 8" upon receipt confirmation.
- [x] 3.3 Update the aside confirmation card in `src/routes/orders_.$orderId.tracking.tsx` to render in yellow (`bg-yellow`) with clear "Aguardando confirmação" context while awaiting confirmation, and green (`bg-green`) once confirmed.
- [x] 3.4 Adjust the prototype stage skip control behavior to cleanly integrate with the 8-step journey.

## 4. Orders History Page Updates

- [x] 4.1 Update `src/routes/orders.tsx` order cards to show the yellow "Aguardando confirmação" badge for arrived unconfirmed orders and green "Recebimento confirmado" for confirmed orders.

## 5. Verification & Automated Tests

- [x] 5.1 Update `tests/delivery.spec.ts` to validate 8 stages, verifying "Etapa 7 de 8" in yellow before confirmation and "Etapa 8 de 8" in green after confirmation.
- [x] 5.2 Execute test suite and lint/type checks to verify all scenarios pass cleanly.
