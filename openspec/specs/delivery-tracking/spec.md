# delivery-tracking Specification

## Purpose
Simulated real-time 7-stage package delivery tracking system with live timeline, progress truck animation, active stage countdown, stage transition roasts, and interactive prototype stage skip.
## Requirements
### Requirement: 7-stage delivery progression
The application SHALL calculate the simulated delivery status of any saved order based on the elapsed time since its `createdAt` timestamp plus an accumulated prototype displacement (`skew`). The complete order fulfillment journey SHALL consist of 8 distinct steps (6 transit steps, 1 destination arrival step awaiting confirmation, and 1 final confirmed step):
1. *Pedido confirmado* (weight 0.5× / 8s base)
2. *Separando na estante* (weight 1× / 16s base)
3. *Embalado* (weight 1× / 16s base)
4. *Saiu do centro de distribuição* (weight 1.5× / 24s base)
5. *Em trânsito* (weight 2× / 32s base)
6. *Saiu para entrega* (weight 1.5× / 24s base)
7. *Entregue / Aguardando confirmação* (destination arrival stage, reached at 120s base duration; represented as step 7 of 8)
8. *Recebimento confirmado* (terminal stage unlocked upon user confirmation; represented as step 8 of 8)

#### Scenario: Real-time stage progression
- **WHEN** a visitor views the delivery tracking page for an order in transit (stages 1 to 6)
- **THEN** the active delivery stage, remaining stage time, remaining total delivery time, and overall progress percentage reflect the elapsed seconds plus skew relative to the 120s transit timeline, showing "Etapa X de 8"

#### Scenario: Completed delivery state
- **WHEN** the elapsed time plus skew reaches or exceeds 120 seconds and `receiptConfirmed` is false
- **THEN** the delivery is marked as arrived at destination awaiting confirmation (Step 7 of 8), the hero section retains the active yellow tone (`bg-yellow`), and an interactive awaiting confirmation prompt is displayed in yellow

### Requirement: Live delivery tracking UI and animations
The delivery tracking page SHALL present a neo-brutalist two-column layout with a top hero banner. The hero banner SHALL display the order code badge, status title, countdown or completed timestamp ETA, total progress bar with an animated truck indicator moving with the percentage, and a comic halftone pattern. The left column SHALL display a vertical timeline showing completed steps (green dot with checkmark and completion time), current step (yellow dot with pulse animation, countdown to next step, and mini halftone progress bar), and upcoming steps (dashed border with expected arrival time). The right column SHALL display delivery destination details, purchased book items, order timestamp, payment method label, and prototype actions.

#### Scenario: Timeline active step display
- **WHEN** an order is on a non-terminal delivery stage
- **THEN** that stage in the timeline displays an active yellow indicator, a `"Próxima etapa em m:ss"` countdown, and an active progress bar with halftone styling

### Requirement: Stage transition satirical roasts
The delivery tracking page SHALL monitor stage changes while active and trigger a roast toast with an onomatopoeia for each stage advancement:
- Pedido confirmado: `ANOTADO!`
- Separando na estante: `ATCHIM!`
- Embalado: `PLOC!`
- Saiu do centro de distribuição: `VRUUM!`
- Em trânsito: `FIUUU!`
- Saiu para entrega: `BI-BI!`
- Entregue: `DING-DONG!`

#### Scenario: Toast notification on stage advancement
- **WHEN** the elapsed time advances an order from one stage to the next while the tracking page is open
- **THEN** a satirical roast toast notification is displayed featuring the stage's specific onomatopoeia and punchline

### Requirement: Prototype stage skip control
The delivery tracking page SHALL provide an interactive `"Adiantar etapa →"` action button whenever the order has not reached the terminal stage. Clicking the button SHALL calculate the time remaining in the current stage, increment the order's `skew` in state, and immediately advance the order to the next stage without requiring a page reload.

#### Scenario: Skipping to the next stage
- **WHEN** a visitor clicks `"Adiantar etapa →"` on the tracking page
- **THEN** the order's `skew` is updated to cross the current stage boundary, and the UI immediately renders the subsequent stage

### Requirement: Order delivery receipt confirmation
The delivery tracking view SHALL provide an interactive purchase receipt confirmation control whenever an order reaches the destination arrival stage (Stage 7 of 8) and has not yet been confirmed by the user (`receiptConfirmed` is false).
While awaiting confirmation:
- The hero banner SHALL remain in the yellow tone (`bg-yellow`) with status copy indicating awaiting confirmation ("Aguardando confirmação").
- The step indicator SHALL display "Etapa 7 de 8" (or "Step 7 of 8" in English).
- The delivery card in the aside panel SHALL be styled in the yellow palette (`bg-yellow`) rather than turning fully green prematurely.
- The confirmation action button SHALL use responsive text wrapping (`whitespace-normal`), proper flex alignment, and generous touch padding so that the checkmark icon and localized text ("Confirmar recebimento da compra" / "Confirm delivery receipt") never clip, truncate, or overflow the button boundaries.

Upon clicking the confirmation button:
- The application SHALL persist `receiptConfirmed: true` and the current timestamp (`confirmedReceiptAt`) onto the order in local state.
- The delivery status SHALL advance to Stage 8 of 8 ("Recebimento confirmado"), showing "Etapa 8 de 8" and 100% completion.
- The hero banner and delivery stamp card SHALL transition to the celebratory green palette (`bg-green`).
- The tracking UI SHALL replace the confirmation button with a `"RECEBIMENTO CONFIRMADO"` comic stamp and confirmation timestamp.
- The application SHALL trigger a dedicated satirical roast toast notification on confirmation.
- In the order history view (`/orders`), orders with confirmed receipt SHALL display a receipt confirmation badge alongside the delivery stage indicator.

#### Scenario: Prompt user to confirm purchase receipt upon delivery
- **WHEN** an order is in the destination arrival stage (elapsed time >= 120s) and `receiptConfirmed` is falsy
- **THEN** the tracking page displays Step 7 of 8 in the yellow palette with an awaiting confirmation prompt
- **AND** the confirmation button renders its icon and label fully within its border without overflow or clipping

#### Scenario: User confirms delivery receipt
- **WHEN** the visitor clicks `"Confirmar recebimento da compra"`
- **THEN** the order state is updated with `receiptConfirmed: true` and `confirmedReceiptAt` ISO timestamp
- **AND** the delivery status advances to Step 8 of 8 ("Recebimento confirmado")
- **AND** the hero banner and delivery card switch to the green palette (`bg-green`)
- **AND** the tracking UI replaces the action button with a `"RECEBIMENTO CONFIRMADO"` comic stamp and the confirmation timestamp
- **AND** a satirical roast toast notification with onomatopoeia is displayed

#### Scenario: Display receipt confirmation in order history
- **WHEN** a visitor views `/orders` and an order has `receiptConfirmed: true`
- **THEN** the order card displays a confirmed receipt badge alongside the completed delivery stage badge

