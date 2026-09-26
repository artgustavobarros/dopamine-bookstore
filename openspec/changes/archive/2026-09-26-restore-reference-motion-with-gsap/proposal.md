## Why

The standalone Depois Eu Leio reference has a distinct motion language that the current storefront does not reproduce. Comparing its embedded template with the React app shows missing staged hero entrances, scroll-revealed cards, route entrances, and animated interaction feedback; the current app mainly uses simple hover transitions.

## What Changes

- Recreate the reference's staged hero reveal: badge stamp, staggered heading, dropping book covers, and spinning price seal.
- Reveal catalog cards as they enter the viewport and add subtle pointer tilt and shadow response on supported pointers.
- Add short entrance motion to store routes and conditional content, plus reference-inspired cart, wishlist, toast, menu, and purchase feedback.
- Use GSAP for coordinated motion in React, with ScrollTrigger where scroll position controls a reveal. Preserve reduced-motion, keyboard, touch, and server-rendered behavior.
- Match the reference's timing and feel while retaining the current app's routes, content, and visual structure.

## Capabilities

### New Capabilities

- `reference-motion`: Entrance effects, scroll reveals, and microinteractions inspired by the standalone reference, with accessible motion behavior.

### Modified Capabilities

None.

## Impact

- Affects `src/routes/index.tsx`, shared store components, route shells, feedback surfaces, and related styles.
- Adds `gsap` and `@gsap/react`; uses GSAP ScrollTrigger for viewport reveals.
- Reference source: `C:\Users\arthu\Downloads\Depois Eu Leio (1).html` (`/mnt/c/Users/arthu/Downloads/Depois Eu Leio (1).html` in this workspace).
