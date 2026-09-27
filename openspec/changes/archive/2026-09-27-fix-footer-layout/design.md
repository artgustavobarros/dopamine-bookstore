## Context

The storefront currently structures pages using `StoreLayout` (`src/components/store/layout.tsx`). The outer container has `min-h-screen bg-paper text-ink`, but is not configured as a flex column container (`flex flex-col`), and the `<main id="main-content">` landmark lacks `flex-1`. Consequently, when routes have sparse or short content (such as 404 not found, empty shopping cart, empty wishlist, or loading states), `<main>` does not expand to consume the available vertical space. This causes the footer to float higher up the screen, leaving an awkward empty gap below the footer or breaking the expected visual frame.

Furthermore, on mobile browsers with dynamic URL and navigation bars, `100vh` (`min-h-screen`) can cause content overflow or jumpiness; pairing it with `min-h-dvh` ensures exact viewport adaptation.

## Goals / Non-Goals

**Goals:**
- Guarantee that the footer anchors to the bottom of the viewport when content height is shorter than the viewport height.
- Ensure `<main id="main-content">` expands to fill all remaining vertical space (`flex-1`).
- Support dynamic viewport sizing (`min-h-screen min-h-dvh`) for seamless display on both desktop and mobile devices with collapsible browser UI.
- Maintain natural document scrolling when content exceeds viewport height without artificial scrollbars or fixed-position overlap.

**Non-Goals:**
- Making the footer fixed (`position: fixed`) over content.
- Altering the visual design, contents, or links inside the footer.
- Modifying individual page content components unless necessary for flex alignment.

## Decisions

### Decision: Flexbox sticky footer with dynamic viewport units
- **Choice**: Apply `flex flex-col min-h-screen min-h-dvh` to the layout root container and `flex-1` to `<main id="main-content">`.
- **Rationale**: This is the modern, cleanest pattern for sticky footers. The container occupies at least 100% of the dynamic viewport height (`min-h-dvh` with `min-h-screen` fallback), `<main>` grows via `flex-1`, and `<footer>` naturally sits at the bottom when content is brief, while scrolling normally when content is tall.
- **Alternatives considered**:
  - `position: fixed` / `position: sticky` footer: Requires artificial bottom padding on `<main>` to prevent content clipping and causes footer to obscure view on small screens.
  - CSS Grid (`grid-template-rows: auto 1fr auto`): Works similarly, but flexbox is simpler, more conventional across the existing codebase, and aligns with Tailwind utilities.

### Decision: Main element flex growth and internal structure
- **Choice**: Set `<main id="main-content" className="flex-1 flex flex-col">`.
- **Rationale**: Setting `flex-1 flex flex-col` on `<main>` allows nested components (such as full-height empty states or 404 cards) to also stretch vertically if needed, preventing abrupt background clipping.

## Risks / Trade-offs

- **[Risk]** Nested pages with explicit heights or percentage heights might behave unexpectedly.
  → *Mitigation*: Existing pages use standard container wrappers (`mx-auto max-w-7xl px-4 py-8` etc.) with block/flex children, which fit naturally inside `flex-1`.
