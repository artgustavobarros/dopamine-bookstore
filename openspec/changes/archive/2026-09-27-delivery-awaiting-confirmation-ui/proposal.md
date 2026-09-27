## Why

When an order arrives at its destination, the tracking interface prematurely turned completely green and displayed "Etapa 7 de 7", which confused users into thinking the delivery process was 100% complete before they actually acknowledged and confirmed receipt of the package. Furthermore, the confirmation action button suffered from layout clipping where the checkmark icon and long localized button label ("Confirmar recebimento da compra") overflowed and broke out of the button container in narrower columns.

## What Changes

- **8-Stage Delivery Progression**: Split the completion sequence into an 8th stage. Stage 7 represents package arrival awaiting customer confirmation ("Entregue / Aguardando confirmação", displaying "Etapa 7 de 8"). Stage 8 represents officially confirmed delivery ("Recebimento confirmado", displaying "Etapa 8 de 8").
- **Awaiting Confirmation Palette**: While an order is delivered but receipt has not been confirmed, preserve the attention-grabbing yellow palette (`bg-yellow`) across the hero banner and confirmation aside card with explicit "Aguardando confirmação" copy, avoiding premature all-green styling.
- **Completion on Confirmation**: Transition the hero banner, timeline, and delivery status badge to full green (`bg-green`) and 8 of 8 only after the user actively clicks to confirm receipt.
- **Receipt Confirmation Button Layout Fix**: Ensure the confirmation button handles multi-line localized text and icon alignment gracefully (`whitespace-normal`, proper flex alignment and padding) so text and icons never clip or spill outside the border.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `delivery-tracking`: Expand progression to 8 stages with Stage 7 as "Aguardando confirmação" (Etapa 7 de 8 in yellow palette) and Stage 8 as "Recebimento confirmado" (Etapa 8 de 8 in green palette); update receipt confirmation button layout to prevent text/icon overflow.

## Impact

- `src/lib/delivery.ts`: Stage definitions, step counting (8 total steps), progress percentage calculations, timeline steps generation, and stage color helpers.
- `src/routes/orders_.$orderId.tracking.tsx`: Tracking hero styling, step count indicator ("X de 8"), awaiting confirmation status banner and aside card colors, and receipt confirmation button styling.
- `src/routes/orders.tsx`: Order history badge colors and stage naming reflecting awaiting confirmation vs receipt confirmed.
- `src/lib/i18n.ts`: Localized labels for the 8th stage and awaiting confirmation indicators in Portuguese and English.
- `tests/delivery.spec.ts`: Updates to stage count expectations (8 stages), step text assertions, and flow verifications.
