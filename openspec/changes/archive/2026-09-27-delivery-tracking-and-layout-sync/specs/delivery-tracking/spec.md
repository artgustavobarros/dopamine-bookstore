## ADDED Requirements

### Requirement: 7-stage delivery progression
The application SHALL calculate the simulated delivery status of any saved order based on the elapsed time since its `createdAt` timestamp plus an accumulated prototype displacement (`skew`). It SHALL sequence through 7 distinct delivery stages with durations relative to a base step interval (16 seconds base; total delivery duration 120 seconds):
1. *Pedido confirmado* (weight 0.5× / 8s base)
2. *Separando na estante* (weight 1× / 16s base)
3. *Embalado* (weight 1× / 16s base)
4. *Saiu do centro de distribuição* (weight 1.5× / 24s base)
5. *Em trânsito* (weight 2× / 32s base)
6. *Saiu para entrega* (weight 1.5× / 24s base)
7. *Entregue* (terminal stage)

#### Scenario: Real-time stage progression
- **WHEN** a visitor views the delivery tracking page for an order
- **THEN** the active delivery stage, remaining stage time, remaining total delivery time, and overall progress percentage reflect the elapsed seconds plus skew relative to the 120s total timeline

#### Scenario: Completed delivery state
- **WHEN** the elapsed time plus skew reaches or exceeds 120 seconds
- **THEN** the delivery is marked as `"Entregue"`, the hero section switches to the green tone, the progress icon transitions to a terminal star (`★`), and a celebratory `"ENTREGUE!"` comic stamp card is displayed

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
