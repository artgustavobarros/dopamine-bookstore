## Why

On pages with short or minimal content (such as empty cart, empty wishlist, 404 not found, or during catalog loading states), the footer breaks or floats in the middle of the screen, leaving an awkward gap or visual disconnect below it. Establishing a dynamic viewport-aware flex column layout ensures the footer always anchors neatly to the bottom of the screen regardless of content height.

## What Changes

- Modify `StoreLayout` wrapper to use `flex flex-col min-h-screen min-h-dvh` to occupy the full viewport height on both desktop and mobile browsers.
- Add `flex-1` to the main content container (`<main id="main-content">`) so it automatically expands to fill available vertical space.
- Adjust footer alignment and spacing so the footer cleanly sticks to the bottom when content is sparse while remaining naturally pushed down on scrollable content.

## Capabilities

### New Capabilities
<!-- No new capabilities introduced -->

### Modified Capabilities
- `storefront-experience`: Specify responsive sticky footer layout behavior where the main landmark expands to fill available vertical space and the footer anchors to the viewport bottom when content height is shorter than the viewport.

## Impact

- Affected code: `src/components/store/layout.tsx` (and `src/routes/__root.tsx` if needed for 404 layout consistency).
- Affected dependencies/APIs: None. Purely CSS/Tailwind utility class and HTML landmark structuring.
