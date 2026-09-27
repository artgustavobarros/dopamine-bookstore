# reference-motion Specification

## Purpose
Define the storefront motion and interaction feedback, including accessible behavior and animation cleanup.
## Requirements
### Requirement: Staged storefront entrance
The application SHALL animate the home hero on entry with a badge stamp, staggered heading, dropping featured covers, and a spinning seal in the order and approximate timing shown by the standalone reference. The content SHALL remain usable throughout the entrance.

On fine-pointer devices, the featured covers SHALL make a small, bounded movement while hovered and settle when the pointer leaves.

#### Scenario: Open home
- **WHEN** a visitor opens the home route with motion enabled
- **THEN** the hero elements enter in sequence and settle into their normal layout within a short entrance sequence

#### Scenario: Hover featured book
- **WHEN** a fine-pointer visitor hovers a featured book after the hero enters
- **THEN** the book shifts and tilts slightly, then returns to rest when the pointer leaves

### Requirement: Catalog reveal and pointer response
The application SHALL reveal catalog cards once as they enter the viewport, including cards added by filter changes. On fine-pointer devices, cards SHALL respond with a subtle bounded tilt and stronger hover shadow, and return to rest on pointer leave.

Cards that enter together in the same grid row SHALL reveal with a short stagger.

#### Scenario: Scroll into catalog
- **WHEN** a visitor scrolls until a book card enters the viewport
- **THEN** the card rises, straightens, and becomes fully visible without replaying on ordinary scroll reversal
- **AND** cards entering together appear in a brief left-to-right sequence

#### Scenario: Change filters
- **WHEN** a visitor changes catalog filters and the visible cards change
- **THEN** newly rendered cards can reveal and removed cards leave no active animation or scroll trigger

#### Scenario: Move pointer over card
- **WHEN** a fine-pointer visitor moves across a book card and then leaves it
- **THEN** the card tilts slightly, its shadow responds, and the card returns to its resting position

### Requirement: Navigation and state feedback
The application SHALL provide reference-inspired micro-interactions utilizing the native `@keyframes del-*` CSS animation system (`del-in`, `del-card`, `del-pop`, `del-stamp`, `del-drop`, `del-heart`, `del-bump`, `del-sheet`, `del-fade`, `del-spin`). Interactive buttons SHALL implement tactile hover physics where the button translates by `(-2px, -2px)` and its offset shadow expands from `4px` to `6px`, and active click collapses the translation to `(3px, 3px)` with shadow collapse. Adding a book to the cart SHALL trigger `del-pop` on the button label and `del-bump` on the header cart count badge. Toggling wishlist status SHALL trigger `del-heart` on the heart icon.

#### Scenario: Button hover and click micro-interactions
- **WHEN** a visitor hovers over or activates an interactive button
- **THEN** the button shifts upwards and its hard shadow expands to 6px, and on press translates down and collapses its shadow

#### Scenario: Cart counter badge bump
- **WHEN** a book is added to the cart
- **THEN** the cart count badge runs the `del-bump` scale-up animation

#### Scenario: Wishlist heart scale animation
- **WHEN** a book is saved to or removed from the wishlist
- **THEN** the heart icon runs the `del-heart` scale pop animation

#### Scenario: Stamped confirmation feedback
- **WHEN** a visitor simulates payment or confirms an order
- **THEN** the status badge enters with the `del-stamp` scaling and rotation animation

### Requirement: Motion accessibility and lifecycle
The application SHALL keep content visible before client hydration, stop decorative motion for visitors who request reduced motion, and clean up GSAP animations and ScrollTriggers when owning components change or unmount. Keyboard and touch actions SHALL remain fully usable.

#### Scenario: Reduced motion
- **WHEN** a visitor enables reduced motion before or during a visit
- **THEN** the application shows final visual states without entrance, scroll, or pointer animation

#### Scenario: Server render and route change
- **WHEN** the app server-renders a route and later navigates away after hydration
- **THEN** content is readable before hydration and no animation continues against the unmounted route

