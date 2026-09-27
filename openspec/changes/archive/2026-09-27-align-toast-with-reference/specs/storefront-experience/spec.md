## MODIFIED Requirements

### Requirement: Accessible feedback and navigation
The application SHALL use semantic links and buttons, expose accessible names for icon-only controls, show keyboard focus, respect reduced-motion preference, and announce action feedback without blocking navigation. All toast notifications for user actions (including adding to cart, duplicate item notices, wishlist modifications, review submissions, and copied text) SHALL render using the comic speech-bubble notification model with an uppercase sound-effect tag (`sfx`) and formatted body text.

#### Scenario: Keyboard interaction
- **WHEN** a visitor navigates with a keyboard and activates the cart control
- **THEN** focus is visible, the cart route opens, and its heading identifies the page

#### Scenario: Comic toast feedback on storefront actions
- **WHEN** a visitor adds a book to the cart, encounters a duplicate item, or toggles wishlist state
- **THEN** a comic speech-bubble toast appears with an uppercase Bangers SFX header and descriptive message, positioned with a speech bubble beak and del-pop entrance motion
