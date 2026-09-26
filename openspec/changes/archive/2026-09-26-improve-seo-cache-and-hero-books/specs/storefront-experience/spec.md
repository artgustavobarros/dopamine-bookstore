## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Marketplace simulation disclosure in storefront
The application SHALL display unambiguous disclosures across the storefront (in the announcement bar, hero, and footer) confirming that Dopamine Bookstore is a simulated demonstration marketplace where no payment is processed and no physical goods are delivered.

#### Scenario: Visitor views storefront disclosures
- **WHEN** a visitor reads the storefront header bar, hero badge, or footer
- **THEN** the copy clearly confirms that all purchases are simulated and zero actual currency is charged
