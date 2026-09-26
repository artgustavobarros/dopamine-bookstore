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
The application SHALL provide short reference-inspired entrance motion for store routes and inserted panels, and animated feedback for cart count changes, add-to-cart labels, wishlist state, toast appearance, mobile menu opening, and purchase confirmation. Motion SHALL reflect the resulting state and SHALL NOT delay the action.

#### Scenario: Add book and save wish
- **WHEN** a visitor adds a book to the cart or changes its wishlist state
- **THEN** the relevant label or heart responds and the cart count bumps when its value changes

#### Scenario: Navigate and finish checkout
- **WHEN** a visitor navigates between store routes or completes the simulated checkout
- **THEN** the new page enters briefly and the confirmation mark receives a stamp effect

#### Scenario: Open menu and receive toast
- **WHEN** a visitor opens the mobile menu or receives action feedback
- **THEN** the menu panel and backdrop or toast animate without blocking dismissal, focus, or screen-reader announcements

### Requirement: Motion accessibility and lifecycle
The application SHALL keep content visible before client hydration, stop decorative motion for visitors who request reduced motion, and clean up GSAP animations and ScrollTriggers when owning components change or unmount. Keyboard and touch actions SHALL remain fully usable.

#### Scenario: Reduced motion
- **WHEN** a visitor enables reduced motion before or during a visit
- **THEN** the application shows final visual states without entrance, scroll, or pointer animation

#### Scenario: Server render and route change
- **WHEN** the app server-renders a route and later navigates away after hydration
- **THEN** content is readable before hydration and no animation continues against the unmounted route
