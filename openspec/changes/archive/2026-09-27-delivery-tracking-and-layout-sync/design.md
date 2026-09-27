## Context

The Dopamine Bookstore ("Depois Eu Leio") is a satirical pop-art neo-brutalist bookstore built with React 19, TanStack Start / Router, Tailwind CSS v4, and Zustand. The reference prototype (`Depois Eu Leio.html`) and accompanying specification files (`PROJETO.md`, `ENDERECOS-PAGAMENTO-ENTREGA.md`) define a 7-stage delivery simulation system where users track the progress of books they promised to read.

Currently, the TanStack application implements simulated checkout and order creation, but lacks the real-time delivery tracking route, live timeline, truck animations, stage skipping mechanism, order stage status badges in the orders list, and updated confirmation layout.

## Goals / Non-Goals

**Goals:**
- Implement the dedicated 7-stage delivery tracking screen at `/orders/$orderId/tracking` matching the prototype layout, colors, typography, and halftone graphics.
- Implement mathematically accurate stage progression based on `createdAt` and accumulated `skew`, cycling through:
  1. *Pedido confirmado* (8s)
  2. *Separando na estante* (16s)
  3. *Embalado* (16s)
  4. *Saiu do centro de distribuição* (24s)
  5. *Em trânsito* (32s)
  6. *Saiu para entrega* (24s)
  7. *Entregue* (terminal)
- Render the hero section with color transition (yellow during transit, green when delivered), moving comic truck indicator (`▶` / `★`), ETA countdown, and order code stamp.
- Provide a two-column layout with vertical timeline (completed, active pulsing, upcoming steps) and order summary with prototype skip control (`"Adiantar etapa →"`).
- Trigger satirical toast notifications with comic onomatopoeias (`ANOTADO!`, `ATCHIM!`, `PLOC!`, `VRUUM!`, `FIUUU!`, `BI-BI!`, `DING-DONG!`) on stage transitions.
- Update `/orders` with real-time stage badges (Yellow for 1–3, Blue for 4–5, Red for 6, Green for 7), mini progress bars, and tracking CTA links.
- Update `/checkout/complete/$orderId` with the blue hero banner, 4 reading metrics, and primary tracking CTA.
- Persist `skew` in the Zustand store's `Order` schema.

**Non-Goals:**
- Real-world postal or carrier APIs (the tracking is strictly simulated and satirical).
- Modifying catalog, reviews, or wishlist systems.

## Decisions

### Decision 1: Dedicated Delivery Tracking Domain Module (`src/lib/delivery.ts`)
- **Choice**: Encapsulate all delivery tracking constants, math, stage definitions, and helper functions in a single domain module:
  - `STAGES`: Weights `[0.5, 1, 1, 1.5, 2, 1.5, 0]`, icons, labels, descriptions, and roasts.
  - `calculateDeliveryState(order, now)`: Calculates elapsed time, active stage index, remaining seconds in stage, remaining total seconds, total progress percentage, and clock formatted times.
  - `getStageColorClass(stageIndex)`: Returns the neo-brutalist background and text color tokens matching the prototype rules (Yellow for 0–2, Blue for 3–4, Red for 5, Green for 6).
- **Alternative considered**: Implementing tracking math inline within React components.
- **Rationale**: Isolating the calculation ensures identical behavior between `/orders/$orderId/tracking`, `/orders`, and background roast checks, and allows straightforward unit testing.

### Decision 2: Route Architecture (`/orders/$orderId/tracking`)
- **Choice**: Add file route `src/routes/orders/$orderId/tracking.tsx` in TanStack Router.
- **Alternative considered**: Modal dialog or query parameter on `/orders`.
- **Rationale**: The reference prototype specifies a standalone screen with its own breadcrumb navigation (`← Pedidos`), shareable URL, and distinct hero presentation.

### Decision 3: Clock-Drift Resistant Stage Derivation
- **Choice**: State is derived purely from `(Date.now() - Date.parse(order.createdAt)) / 1000 + (order.skew || 0)`.
- **Alternative considered**: Storing a step counter that increments with `setInterval`.
- **Rationale**: If the user closes the browser or background tabs, the delivery continues advancing naturally in real time. When reopened, the exact correct stage and elapsed fraction are restored immediately.

### Decision 4: Prototype Fast-Forward (`skew`) in Store
- **Choice**: When `"Adiantar etapa →"` is clicked, the application computes `starts[currentStage + 1] - elapsed + 0.05` and persists it into `order.skew`.
- **Alternative considered**: Modifying `createdAt` directly.
- **Rationale**: Preserves the original purchase timestamp for the order receipt while enabling reliable skipping.

### Decision 5: Neo-Brutalist Visual Tokens & Motion
- **Choice**: Use the project's Tailwind v4 design system tokens: Archivo Black for headings, Bangers for comic stamps and onomatopoeias, Space Mono for timestamps and metrics, hard 3px borders, solid drop shadows (`box-shadow: 6px 6px 0 var(--line)`), radial gradient halftone backgrounds, and bouncing truck animation.

## Risks / Trade-offs

- **[Tab throttling]**: Background tabs might throttle `setInterval`.
  - *Mitigation*: The tick interval only drives UI re-renders; because calculations derive from `Date.now()`, the stage instantly corrects to the right progress the moment the tab becomes visible.
- **[Order not found]**: User navigates directly to `/orders/invalid-id/tracking`.
  - *Mitigation*: Render an `EmptyState` component with a clear CTA to return to `/orders`.
