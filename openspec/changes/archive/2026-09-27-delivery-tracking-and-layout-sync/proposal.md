## Why

The standalone prototype (`Depois Eu Leio.html`) and project specifications (`PROJETO.md`, `ENDERECOS-PAGAMENTO-ENTREGA.md`) introduced major updates to the purchase and post-purchase experience—most prominently a real-time simulated 7-stage delivery tracking screen (`Rastreio`), delivery status progress tracking and color-coded stage badges in the orders list, updated order confirmation layout and metrics, and prototype stage acceleration (`"Adiantar etapa →"`). The TanStack application needs to replicate these delivery and checkout updates to maintain parity with the design system and interactive prototype.

## What Changes

- **New Simulated Delivery Tracking Experience**: Implement a dedicated tracking screen (`/orders/$orderId/tracking`) modeling the 7 comic delivery stages:
  1. *Pedido confirmado* (0.5× / 8s base)
  2. *Separando na estante* (1× / 16s base)
  3. *Embalado* (1× / 16s base)
  4. *Saiu do centro de distribuição* (1.5× / 24s base)
  5. *Em trânsito* (2× / 32s base)
  6. *Saiu para entrega* (1.5× / 24s base)
  7. *Entregue* (terminal stage)
- **Animated Truck & Progress Bar**: Display total progress percentage with a moving comic truck indicator (`▶` / `★`), overall ETA countdown, and color shift between in-transit (yellow hero) and delivered (green hero).
- **Interactive Delivery Timeline**: Two-column layout featuring completed stages (green with checkmark and completion time), current stage (yellow with pulsing glow, remaining stage countdown, and mini halftone progress bar), and upcoming stages (dashed border with estimated arrival time).
- **Stage Transition Roasts**: Fire satirical toast notifications on stage changes with sound effects / onomatopoeias: `ANOTADO!`, `ATCHIM!`, `PLOC!`, `VRUUM!`, `FIUUU!`, `BI-BI!`, `DING-DONG!`.
- **Prototype Acceleration (`"Adiantar etapa →"`)**: Allow users to skip to the next delivery stage instantly by storing an accumulated time displacement (`skew`) on the order.
- **Enhanced Order Confirmation Layout**: Synchronize `/checkout/complete/$orderId` with the prototype’s blue neo-brutalist hero banner, rotated order code stamp, 4 metric blocks (unspent money, pages on conscience, estimated reading hours, shelf books count), and primary `"Acompanhar entrega →"` CTA.
- **Order History Status & Tracking Badges**: Enhance `/orders` with real-time delivery stage badges matching the 4 neo-brutalist color categories (Stages 1–3 Yellow, 4–5 Blue, 6 Red, 7 Green), a mini progress bar for each order, and direct `"Acompanhar entrega →"` buttons.
- **Store & I18n Expansion**: Extend `orderSchema` in `src/lib/store.ts` to persist `skew`, and supply full bilingual (PT-BR / EN) strings in `src/lib/i18n.ts`.

## Capabilities

### New Capabilities
- `delivery-tracking`: Simulated real-time 7-stage package delivery tracking screen with live timeline, progress truck animation, active stage countdown, stage transition roasts, and interactive prototype stage skip.

### Modified Capabilities
- `simulated-checkout`: Updates order history and order confirmation requirements to link into the delivery tracking flow, present real-time stage badges and mini progress indicators, and reflect updated post-purchase metrics.

## Impact

- **Affected Routes & Components**:
  - `src/routes/orders/$orderId/tracking.tsx` (new route)
  - `src/routes/orders.tsx` (modified orders list with live stage badges and tracking triggers)
  - `src/routes/checkout/complete/$orderId.tsx` (modified confirmation hero, metric blocks, and tracking CTA)
- **Affected State & Logic**:
  - `src/lib/store.ts` (`Order` type with optional `skew` number, `advanceOrderStage` action)
  - `src/lib/i18n.ts` (bilingual delivery tracking and stage strings)
- **Dependencies**: No external runtime dependencies added; standard React, TanStack Router, Zustand, and Tailwind v4 tokens.
