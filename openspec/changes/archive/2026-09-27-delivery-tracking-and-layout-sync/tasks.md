## 1. Domain Modeling & State Extension

- [x] 1.1 Extend `orderSchema` and `Order` type in `src/lib/store.ts` with optional `skew: z.number().default(0)` and add `skipOrderStage(orderId: string)` action.
- [x] 1.2 Create `src/lib/delivery.ts` defining the 7 stages (`STAGES` weights, icons, bilingual labels, descriptions, and roasts), `calculateDeliveryState`, and color coding helpers.
- [x] 1.3 Add bilingual delivery tracking strings, stage labels, and timing copy to `src/lib/i18n.ts`.

## 2. Delivery Tracking Screen Route & Visuals

- [x] 2.1 Create the delivery tracking route at `src/routes/orders/$orderId/tracking.tsx` with breadcrumb navigation back to `/orders`.
- [x] 2.2 Implement the tracking hero banner featuring color transitions (yellow to green), order code badge, ETA countdown, total progress bar, and animated truck indicator.
- [x] 2.3 Implement the vertical delivery timeline featuring completed stages (green checkmark), active stage (yellow pulsing indicator, remaining countdown, and mini halftone bar), and upcoming stages.
- [x] 2.4 Implement the order summary card (delivery address, book items, payment label), delivered celebration stamp card (`ENTREGUE!`), and prototype skip control (`"Adiantar etapa →"`).
- [x] 2.5 Wire stage transition tracking to fire satirical toast notifications with stage onomatopoeias (`ANOTADO!`, `ATCHIM!`, `PLOC!`, `VRUUM!`, `FIUUU!`, `BI-BI!`, `DING-DONG!`).

## 3. Order History & Confirmation Synchronization

- [x] 3.1 Update `src/routes/orders.tsx` cards to display live stage badges with 4 neo-brutalist color categories, mini delivery progress bar, and `"Acompanhar entrega →"` tracking links.
- [x] 3.2 Update `src/routes/checkout/complete/$orderId.tsx` with the blue hero banner, rotated stamp, 4 post-purchase metric blocks, and primary `"Acompanhar entrega →"` CTA.

## 4. Verification & Testing

- [x] 4.1 Run type checking and build (`pnpm build` / `pnpm check`) to verify clean compilation with no regressions.
- [x] 4.2 Verify end-to-end flow from checkout to order confirmation, tracking page live progression, stage skip acceleration, and orders history view.
