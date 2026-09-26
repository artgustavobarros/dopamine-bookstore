# storefront-experience Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Reference-inspired responsive storefront
The application SHALL present the Depois Eu Leio brand with the reference's paper-and-ink palette, bold typography, colored book/category accents, outlined controls, offset shadows, announcement strip, and hero. The hero section SHALL display the three featured books rendered with their actual cover artwork framed with black outlines and dark backgrounds, rather than solid red and blue placeholder blocks and text title overlays. It SHALL keep primary actions usable on mobile and desktop.

#### Scenario: Desktop storefront
- **WHEN** a visitor opens the home route on a desktop viewport
- **THEN** the hero, catalog controls, book cards, and primary navigation are visible and arranged without horizontal overflow

#### Scenario: Mobile storefront
- **WHEN** a visitor opens the store on a narrow viewport
- **THEN** the layout reflows, a mobile navigation control exposes the same destinations, and all primary actions remain reachable

#### Scenario: Hero featured books visual presentation
- **WHEN** the hero section renders the three featured books
- **THEN** each featured book card displays its cover artwork framed with black styling instead of solid red and blue background fills (`bg-red` and `bg-blue`) and book title banners

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
The application SHALL use semantic links and buttons, expose accessible names for icon-only controls, show keyboard focus, respect reduced-motion preference, and announce action feedback without blocking navigation.

#### Scenario: Keyboard interaction
- **WHEN** a visitor navigates with a keyboard and activates the cart control
- **THEN** focus is visible, the cart route opens, and its heading identifies the page

### Requirement: Marketplace simulation disclosure in storefront
The application SHALL display unambiguous disclosures across the storefront (in the announcement bar, hero, and footer) confirming that Dopamine Bookstore is a simulated demonstration marketplace where no payment is processed and no physical goods are delivered.

#### Scenario: Visitor views storefront disclosures
- **WHEN** a visitor reads the storefront header bar, hero badge, or footer
- **THEN** the copy clearly confirms that all purchases are simulated and zero actual currency is charged

