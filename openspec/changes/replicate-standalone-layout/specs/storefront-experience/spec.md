## MODIFIED Requirements

### Requirement: Reference-inspired responsive storefront
The application SHALL present the Depois Eu Leio brand with the reference's paper-and-ink palette using native OKLCH tokens (`oklch(90.5% 0.182 98.111)` yellow, `oklch(63.7% 0.237 25.331)` red, `oklch(62.3% 0.214 259.815)` blue, `oklch(79.2% 0.209 151.711)` green, `oklch(82.3% 0.12 346.018)` pink, `oklch(97% 0.001 106.424)` light paper, and `oklch(14.7% 0.004 49.25)` ink). The catalog card SHALL feature a flush book cover with a 3/4 aspect ratio and radial halftone dot overlay attached directly to the top edge of the card with `border-bottom: 3px solid var(--line)` without inset padding. The catalog card's body below the cover SHALL display compact metadata in Space Mono, the price in Archivo Black, and bottom action buttons where the Add button dynamically turns green with `"✓ No carrinho"` upon being added to the cart and the wishlist heart button turns red with a white heart when wishlisted. The card article SHALL display an 8px red offset shadow (`box-shadow: 8px 8px 0 oklch(63.7% 0.237 25.331)`) on hover.

#### Scenario: Desktop storefront with OKLCH palette and flush cards
- **WHEN** a visitor opens the home route on a desktop viewport
- **THEN** the storefront displays the warm OKLCH paper background, and catalog book cards render with flush 3/4 covers, halftone dot textures, and red hover shadows on the card container

#### Scenario: Add to cart and wishlist button states on catalog card
- **WHEN** a visitor adds a book to the cart or toggles its wishlist status from the card
- **THEN** the Add button turns green (`oklch(79.2% 0.209 151.711)`) and displays `"✓ No carrinho"`
- **AND** the wishlist button turns solid red (`oklch(63.7% 0.237 25.331)`) with a white heart icon

#### Scenario: Mobile storefront
- **WHEN** a visitor opens the store on a narrow viewport
- **THEN** the layout reflows, a mobile navigation control exposes the same destinations, and all primary actions remain reachable
