# storefront-experience Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
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

### Requirement: Language and theme preferences
The application SHALL offer Portuguese and English interface text and light and dark themes, defaulting to Portuguese and light theme. It SHALL save selected preferences in local storage. At viewport widths where the hamburger navigation is shown, the language and theme controls SHALL appear at the bottom of its sheet after the navigation links and SHALL not appear in the header. At viewport widths where desktop navigation is shown, both controls SHALL appear in the header.

#### Scenario: Change language and theme
- **WHEN** a visitor chooses English and dark theme, then reloads the page
- **THEN** the selected language and theme are restored after browser state hydration

#### Scenario: Preferences at hamburger widths
- **WHEN** a visitor opens the hamburger sheet below the desktop navigation breakpoint
- **THEN** the language and theme controls are available at the bottom of the sheet after the navigation links, absent from the header, and usable without closing the sheet

#### Scenario: Preferences at desktop widths
- **WHEN** a visitor views the store at or above the desktop navigation breakpoint
- **THEN** the language and theme controls are available in the header and the hamburger sheet is not shown

#### Scenario: Preferences on a short mobile viewport
- **WHEN** a visitor opens the hamburger sheet on a short mobile viewport
- **THEN** the language and theme controls remain visible and reachable at the bottom while the navigation links can scroll

### Requirement: Accessible feedback and navigation
The application SHALL use semantic links and buttons, expose accessible names for icon-only controls, show keyboard focus, respect reduced-motion preference, and announce action feedback without blocking navigation. All toast notifications for user actions (including adding to cart, duplicate item notices, wishlist modifications, review submissions, and copied text) SHALL render using the comic speech-bubble notification model with an uppercase sound-effect tag (`sfx`) and formatted body text.

#### Scenario: Keyboard interaction
- **WHEN** a visitor navigates with a keyboard and activates the cart control
- **THEN** focus is visible, the cart route opens, and its heading identifies the page

#### Scenario: Comic toast feedback on storefront actions
- **WHEN** a visitor adds a book to the cart, encounters a duplicate item, or toggles wishlist state
- **THEN** a comic speech-bubble toast appears with an uppercase Bangers SFX header and descriptive message, positioned with a speech bubble beak and del-pop entrance motion

### Requirement: Marketplace simulation disclosure in storefront
The application SHALL display unambiguous disclosures across the storefront (in the announcement bar, hero, and footer) confirming that Dopamine Bookstore is a simulated demonstration marketplace where no payment is processed and no physical goods are delivered.

#### Scenario: Visitor views storefront disclosures
- **WHEN** a visitor reads the storefront header bar, hero badge, or footer
- **THEN** the copy clearly confirms that all purchases are simulated and zero actual currency is charged

### Requirement: Interactive button pointer cursor
The application SHALL display a pointer cursor (`cursor: pointer`) for all native `<button>` elements and all non-native interactive elements with `role="button"` whenever they are not disabled or marked with `aria-disabled="true"`. The application SHALL NOT display a pointer cursor when buttons or `role="button"` elements are disabled, displaying a disabled affordance (`cursor: not-allowed`) instead.

#### Scenario: Hovering active native button
- **WHEN** a user hovers over any native `<button>` element that is not disabled
- **THEN** the pointer cursor (`cursor: pointer`) is displayed

#### Scenario: Hovering active role button element
- **WHEN** a user hovers over any element with `role="button"` that is not disabled and does not have `aria-disabled="true"`
- **THEN** the pointer cursor (`cursor: pointer`) is displayed

#### Scenario: Hovering disabled button or role button
- **WHEN** a user hovers over a button with the `disabled` attribute or an element with `role="button"` and `aria-disabled="true"`
- **THEN** a disabled cursor (`cursor: not-allowed`) is displayed

### Requirement: Responsive sticky footer and viewport container layout
The storefront layout SHALL establish a dynamic full-viewport column container using dynamic viewport units (`min-h-screen min-h-dvh` with flex column) ensuring that the `<main>` landmark expands to consume available vertical space. When page content is shorter than the viewport height, the footer SHALL anchor cleanly to the bottom of the viewport rather than floating midway up the screen. When content exceeds the viewport height, the footer SHALL remain positioned beneath the content with natural document scrolling.

#### Scenario: Short content or sparse routes
- **WHEN** a visitor navigates to a route with minimal content such as an empty cart, empty wishlist, or not-found page
- **THEN** the `<main>` landmark expands (`flex-1`) to fill the remaining vertical height and the footer anchors to the bottom of the viewport without unstyled voids beneath it

#### Scenario: Scrollable content pages
- **WHEN** a visitor views a catalog or product page whose content height exceeds the viewport height
- **THEN** the document scrolls naturally and the footer is pushed directly below the main content

