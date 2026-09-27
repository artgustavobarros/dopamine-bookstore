## Context

The delivery tracking flow simulates a package's progression from order placement to destination delivery. Previously, the flow consisted of 7 automated stages, with stage 7 being "Entregue" (terminal). When an order reached 120 seconds of elapsed time, it immediately turned green and declared "Etapa 7 de 7", even though the user had not yet confirmed receipt of the package.
Furthermore, the confirmation button in the tracking aside card rendered `"✓ Confirmar recebimento da compra"` inside an element constrained by `whitespace-nowrap` from the base button styles, causing the checkmark icon and long label to overflow its borders in the 360px sidebar and on smaller viewports.

## Goals / Non-Goals

**Goals:**
- Implement an 8th stage in the delivery lifecycle representing user confirmation ("Recebimento confirmado").
- Display "Etapa 7 de 8" while the order has arrived at the destination but has not yet been confirmed by the user.
- Maintain an attention-grabbing yellow palette (`bg-yellow`) for both the tracking hero banner and the aside delivery card while awaiting confirmation ("Aguardando confirmação"), preventing premature green styling.
- Transition the hero banner, timeline, and delivery status badge to full green (`bg-green`) and "Etapa 8 de 8" (100% completion) only after the user actively confirms receipt.
- Fix the receipt confirmation button layout and typography so that the icon and multi-line localized text wrap neatly (`whitespace-normal`, flex layout, proper line-height and padding) without ever overflowing or clipping.
- Update the order history list (`/orders`) to reflect the "Aguardando confirmação" state in yellow when package is delivered but unconfirmed, and green when confirmed.

**Non-Goals:**
- Altering the backend or network transport (all orders and delivery states remain browser-local in Zustand storage).
- Changing the base transit times (120s total base transit time remains identical for the 6 transit steps).

## Decisions

### 1. 8 Stages with Split Completion (Transit vs User Confirmation)
- **Decision**: Define 8 distinct steps in `DELIVERY_STAGES` and `calculateDeliveryState`:
  - Step 1: *Pedido confirmado* (w: 0.5)
  - Step 2: *Separando na estante* (w: 1)
  - Step 3: *Embalado* (w: 1)
  - Step 4: *Saiu do centro de distribuição* (w: 1.5)
  - Step 5: *Em trânsito* (w: 2)
  - Step 6: *Saiu para entrega* (w: 1.5)
  - Step 7: *Entregue / Aguardando confirmação* (arrived at destination at 120s; requires user action; displayed as Step 7 of 8; tone: yellow)
  - Step 8: *Recebimento confirmado* (unlocked upon `order.receiptConfirmed: true`; displayed as Step 8 of 8; tone: green)
- **Rationale**: Keeps the transit progression intuitive and preserves the comic satire theme where receiving books is only complete once the reader admits they have arrived into their unread pile.
- **Alternative considered**: Keeping 7 stages and using a sub-step 7.1/7.2. Rejected because the user specifically requested "deixa 7 de 8, pq 8 de 8 é depois de confirmar".

### 2. Awaiting Confirmation Styling (Yellow Palette)
- **Decision**:
  - When elapsed time >= 120s and `receiptConfirmed` is false:
    - Hero banner background is `bg-yellow text-ink`.
    - Hero title displays "Aguardando confirmação" (or "Entregue · Aguardando confirmação").
    - Step indicator reads `Etapa 7 de 8` with ~88% progress.
    - Aside delivery card is styled with `bg-yellow text-ink border-[3px] border-line`.
  - When `receiptConfirmed` is true:
    - Hero banner background switches to `bg-green text-ink`.
    - Hero title displays "Recebimento confirmado".
    - Step indicator reads `Etapa 8 de 8` with 100% progress.
    - Aside delivery card shows the green `bg-green` confirmed stamp.
- **Rationale**: Directly satisfies the user requirement ("enquanto não confirmar não deixa tudo verde... deixa meio com um amarelo e a ideia de Aguardando Confirmação").

### 3. Action Button Robust Text Wrapping & Alignment
- **Decision**:
  - In `ActionButton` and/or the confirmation button instance, override `whitespace-nowrap` with `whitespace-normal` (or `text-wrap: balance` / `break-words`).
  - Render the checkmark icon and text with `flex items-center justify-center gap-2` and `text-center leading-snug px-3 py-2.5 min-h-12 w-full`.
  - Ensure the parent container allows flexible height without fixed pixel constraints that cause overflow.
- **Rationale**: Prevents long localized text (especially Portuguese `"Confirmar recebimento da compra"`) from spilling horizontally outside the button container on constrained widths.

### 4. Stage Progression in Order History (`/orders`)
- **Decision**: Update `getStageColorClasses` and `/orders` badge rendering so an order with arrived delivery but unconfirmed receipt displays a yellow "Aguardando confirmação" badge, whereas an order with confirmed receipt displays the green "Recebimento confirmado" badge.
- **Rationale**: Keeps visual consistency across the entire app so status colors always align with the confirmation state.

## Risks / Trade-offs

- **[Risk] Existing test suite expectations for 7 stages** → Update test assertions in `tests/delivery.spec.ts` to expect 8 total stages and verify the yellow "Etapa 7 de 8" before confirmation and green "Etapa 8 de 8" after confirmation.
- **[Risk] Skip stage button behavior at Stage 7** → If user clicks "Adiantar etapa" while at stage 6 (Saiu para entrega), it advances to stage 7 (Entregue / Aguardando confirmação). At stage 7, skip stage is hidden or confirmation CTA is the primary path to advance to stage 8.
