## 1. Motion setup

- [x] 1.1 Add `gsap` and `@gsap/react` dependencies and register `useGSAP` and `ScrollTrigger` for client-side animation.
- [x] 1.2 Add scoped motion helpers for reduced-motion and fine-pointer conditions, with cleanup on route unmount and condition changes.

## 2. Home and catalog

- [x] 2.1 Build a home hero GSAP timeline for the badge, heading lines, featured books, and seal, matching the reference's entrance order and approximate timing.
- [x] 2.2 Reveal visible book cards once with ScrollTrigger; rebuild triggers after catalog filters change and keep server-rendered cards visible before hydration.
- [x] 2.3 Add bounded pointer tilt and shadow response to book cards, with reset on leave and no tilt on touch or reduced-motion devices.
- [x] 2.4 Stagger cards within each visible grid row and add subtle hover movement to featured hero books.

## 3. Navigation and feedback

- [x] 3.1 Add brief scoped entrances to the detail, cart, checkout, confirmation, orders, wishlist, account, and stats routes, plus conditional checkout and validation panels.
- [x] 3.2 Animate cart count changes, add-to-cart labels, wishlist hearts, and the purchase confirmation mark when their state changes.
- [x] 3.3 Match reference toast pop and mobile menu slide/fade timing while preserving dismissal, keyboard focus, and live announcements.

## 4. Verification

- [x] 4.1 Run typecheck and build; resolve GSAP, SSR, or cleanup errors.
- [x] 4.2 Verify hero and card sequence, filter changes, route navigation, state feedback, and mobile menu on desktop and mobile.
- [x] 4.3 Verify reduced motion before and during a visit, keyboard and touch usability, and no hidden content before hydration.
