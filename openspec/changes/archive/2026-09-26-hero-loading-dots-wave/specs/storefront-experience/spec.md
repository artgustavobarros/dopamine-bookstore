# storefront-experience Specification Delta

## MODIFIED Requirements

### Requirement: Reference-inspired responsive storefront
The application SHALL present the Depois Eu Leio brand with the reference's paper-and-ink palette, bold typography, colored book/category accents, outlined controls, offset shadows, announcement strip, and hero. The hero section SHALL display the three featured books rendered with their actual cover artwork framed with black outlines and dark backgrounds, rather than solid red and blue placeholder blocks and text title overlays. While books are loading or waiting for catalog hydration, the hero display container SHALL present only the blue background card with an animated dot-pattern wave, omitting the featured books, top seal, and bottom badge until catalog data is ready. It SHALL keep primary actions usable on mobile and desktop.

#### Scenario: Desktop storefront
- **WHEN** a visitor opens the home route on a desktop viewport
- **THEN** the hero, catalog controls, book cards, and primary navigation are visible and arranged without horizontal overflow

#### Scenario: Mobile storefront
- **WHEN** a visitor opens the store on a narrow viewport
- **THEN** the layout reflows, a mobile navigation control exposes the same destinations, and all primary actions remain reachable

#### Scenario: Hero featured books visual presentation
- **WHEN** the hero section renders the three featured books
- **THEN** each featured book card displays its cover artwork framed with black styling instead of solid red and blue background fills (`bg-red` and `bg-blue`) and book title banners

#### Scenario: Hero loading state while catalog resolves
- **WHEN** the storefront is loading catalog data or featured books are not yet loaded
- **THEN** the hero display renders only the blue card container with the continuous animated dot-pattern wave
- **AND** hides the 3 featured book cards, the top promotional seal, and the bottom status badge until books are loaded
- **AND** reveals and animates the featured books, seal, and status badge simultaneously when catalog data resolves
- **AND** disables or pauses the wave motion when `prefers-reduced-motion: reduce` is active
