## Context

The reference HTML bundles its application inside `__bundler/template`. Its motion comes from `del-in`, `del-card`, `del-pop`, `del-stamp`, `del-drop`, `del-heart`, `del-bump`, `del-sheet`, `del-fade`, and `del-spin` CSS keyframes, plus an `IntersectionObserver` and a small pointer tilt handler. The current TanStack Start app has CSS hover movement, a sheet transition, and a reduced-motion CSS rule, but none of the reference's staged hero, card reveals, route entrances, or state-change animations. The app is server rendered, so content must remain visible before hydration.

Reference motion inventory and implementation targets:

| Reference behavior | Current app gap | Target |
| --- | --- | --- |
| Page enters upward over about 0.4 seconds; hero badge stamps, heading lines stagger, covers drop, seal spins | Home is static | Scoped GSAP home timeline with the same order and approximate timing |
| Catalog cards rise and untwist when about 12% visible; reveal plays once | Cards appear without entrance | ScrollTrigger reveal for current card elements, refreshed after filter changes |
| Card follows pointer with about 1.2° tilt and stronger colored shadow | Card is static | Fine-pointer tilt with bounded GSAP transform; reset on leave |
| Cart count bumps; add label pops; wishlist heart scales | State updates without motion | Animate the changed control and count when state changes |
| Toasts pop; menu backdrop fades and panel slides | Generic toast and sheet motion | Match reference rhythm on existing feedback surfaces |
| Detail, cart, checkout, confirmation, orders, wishlist, account, and stats enter on navigation; conditional panels and confirmation stamp animate | Routes appear at once | Reusable route entrance and small local timelines where content is inserted |

## Goals / Non-Goals

**Goals:**

- Restore recognizable reference timing, direction, scale, and stagger across the existing React routes.
- Keep controls usable during motion and reveal every animated element without relying on motion completion for functionality.
- Respect reduced motion and avoid animations on server render.

**Non-Goals:**

- Rebuild the reference's separate view system, markup, or exact pixel layout.
- Add sound, perpetual motion, scroll pinning, or new store behavior.

## Decisions

1. **Use GSAP timelines, `@gsap/react`, and scoped refs.** Register `useGSAP` and `ScrollTrigger` once in a client-safe animation module. Run timelines inside `useGSAP({ scope })`; use `contextSafe` for pointer and click callbacks that create tweens. This meets the requested GSAP approach and lets React route unmounts revert animations. A direct CSS-keyframe port was considered, but it would leave hero sequencing and state-driven cleanup split across systems.
2. **Keep server HTML in its finished visual state.** Apply entrance start values only after mount with `gsap.fromTo` or a timeline. If JavaScript fails or reduced motion is active, all content stays visible. This avoids hiding catalog content during server rendering.
3. **Use `ScrollTrigger` for catalog reveal.** Create one reveal per rendered card, `once: true`, with a start near the reference's viewport threshold and small stagger among simultaneously visible cards. Rebuild scoped triggers when the filtered book IDs change, and refresh after layout changes. The reference uses `IntersectionObserver`; ScrollTrigger is chosen to keep motion orchestration in GSAP.
4. **Keep motion local to owning components.** Home owns the hero and catalog; `BookCard` owns tilt and control feedback; shared layout owns cart count and navigation sheet; route components own page and conditional-panel entrances. Avoid global DOM selectors, router-level page overlays, and animations of pinned or sticky ancestors. Retain existing CSS hover and press styles where they already match the reference; GSAP handles staged and state-dependent motion.
5. **Gate motion by user and device preferences.** Use `gsap.matchMedia()` for `(prefers-reduced-motion: no-preference)` and `(hover: hover) and (pointer: fine)`. Reduced motion shows final states immediately, including on a live preference change. Touch and keyboard still get clear state changes without pointer tilt. Motion never changes focus or blocks clicks.

## Risks / Trade-offs

- **Filter changes can leave stale triggers.** Tie `useGSAP` dependencies to a stable filtered-ID key, use `revertOnUpdate`, then refresh ScrollTrigger after the new grid mounts.
- **CSS transforms can conflict with GSAP.** Move GSAP targets to inner wrappers or remove competing transform utilities on the same element. Keep press styles on controls separate from animated card wrappers.
- **Server rendering can flash when entrance values start after paint.** Keep initial content visible; accept a small entrance start on hydration rather than hiding content server side. Limit entrance to the first route mount when appropriate.
- **Pointer motion can cost frames or overwhelm users.** Limit tilt to about 1.2°, use `quickTo` or overwritten short tweens, and disable it for coarse pointers and reduced motion.
- **Shared toast and sheet components may contain existing library animations.** Replace or coordinate their classes to avoid double animation; preserve focus trapping, dismissal, and announcements.

## Migration Plan

1. Add GSAP dependencies and scoped motion helpers.
2. Implement home and catalog motion, then shared and route feedback in small groups.
3. Check desktop and mobile, keyboard, reduced motion, route changes, filter changes, and hydration. Rollback removes motion components and dependencies; persisted store data needs no migration.

## Open Questions

None. Treat “microtransactions” in the request as interaction feedback, based on its pairing with entrance effects and animations.
