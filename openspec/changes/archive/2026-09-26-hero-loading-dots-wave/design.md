## Context

The home page hero presents the "Depois Eu Leio" storefront brand. The right-hand visual stage is a neo-brutalist blue card (`bg-blue`, `border-[3px] border-line`, `shadow-[7px_7px_0_var(--line)]`) with a radial dot grid pattern (`bg-[radial-gradient(#14121066_1.3px,transparent_1.5px)]`). 

Currently, while `useQuery` fetches catalog data from Open Library (or before client hydration), `featured` is empty (`[]`). During this window, the user requested that only the blue card and the animated dots wave are displayed—omitting the 3 featured book cards, the top promotional seal, and the bottom status badge until loading completes.

## Goals / Non-Goals

**Goals:**
- Provide a clean, minimal neo-brutalist loading state inside the hero visual container while `catalogQuery` is pending or resolving.
- Implement an animated wave opacity effect across the dot pattern that sweeps smoothly.
- Hide book covers, top seal, and bottom badge during loading, showing only the blue card and wave dots.
- Coordinate a unified GSAP entrance transition for the 3 book cards, top seal, and bottom badge when data resolves.
- Respect `prefers-reduced-motion` settings.

**Non-Goals:**
- Modifying the catalog grid below the hero.
- Changing Open Library queries or schemas.

## Decisions

### 1. Animated Dot Wave via CSS Mask Gradient
- **Choice**: Implement the opacity wave using a CSS `-webkit-mask-image` / `mask-image` linear gradient with `mask-size: 260% 260%` and a `@keyframes hero-dots-wave` animation sweeping across the dot-pattern layer.
- **Rationale**: Highly performant, GPU-composited, disabled under `prefers-reduced-motion`.

### 2. Clean Card During Loading (No Book Skeletons, No Seals/Labels)
- **Choice**: When `isHeroLoading` is true, render only the container and the animated dots layer. Hide book covers, the top seal ("R$ 0,00"), and the bottom status badge until loading resolves.
- **Rationale**: Keeps the hero clean, uncluttered, and focuses attention on the wave animation.

### 3. Coordinated Entrance Upon Resolution
- **Choice**: Once data arrives (`featuredIds` populates), render the 3 books, top seal, and bottom status badge, animating them in via GSAP (`y: -60` for books, `rotation: -200` + `scale: 0` for seal, `y: 10` for badge).
- **Rationale**: Delivers a satisfying, impactful entrance when the shelf is ready.

## Risks / Trade-offs

- **[Risk] CSS mask-image browser compatibility**:
  - *Mitigation*: Specify both `-webkit-mask-*` and standard `mask-*` properties.
- **[Risk] Motion Sensitivity**:
  - *Mitigation*: Deactivate wave animation when `prefers-reduced-motion: reduce` is enabled.
