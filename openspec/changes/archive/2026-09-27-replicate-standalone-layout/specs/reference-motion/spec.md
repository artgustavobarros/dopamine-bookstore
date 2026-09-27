## MODIFIED Requirements

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
