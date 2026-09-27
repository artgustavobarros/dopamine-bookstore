## Why

When visitors open the application or during initial client data loading, the hero section's right-hand visual display is empty because the Open Library catalog has not yet resolved. This leaves a plain static blue box with zeroed counter text until the books suddenly pop into place. Introducing a wave-animated dot loading state maintains the neo-brutalist visual rhythm, communicates that the featured books are on their way, and provides a polished, lively transition.

## What Changes

- Add a loading state to the hero featured book stage in `src/routes/index.tsx` while catalog books are being fetched (`query.isLoading` or initial pending state).
- Implement an animated wave opacity effect on the hero's blue dot-pattern canvas, causing the dots to sweep across in a smooth, continuous wave during the loading phase.
- Render playful neo-brutalist skeleton silhouettes for the three tilted featured books while waiting for catalog data.
- Display contextual loading copy on the bottom counter badge (e.g., "Carregando estante..." / "Loading shelf...") rather than "0 páginas que você não vai ler." during fetch.
- Smoothly transition from the loading wave state to the GSAP-animated featured book cards when data resolves.
- Ensure the dot wave animation respects `prefers-reduced-motion` and pauses or simplifies gracefully.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `storefront-experience`: Add hero loading state requirement and scenarios for the animated wave dot-pattern and placeholder silhouettes while catalog books load.

## Impact

- **UI / Storefront**: `src/routes/index.tsx`, `src/styles.css` (or CSS modules/classes for wave keyframes/masks).
- **Dependencies**: No new external dependencies required; uses existing Tailwind CSS / GSAP motion stack.
- **Accessibility**: Preserves `prefers-reduced-motion` accessibility standards by reducing or halting the continuous wave when motion is disabled.
