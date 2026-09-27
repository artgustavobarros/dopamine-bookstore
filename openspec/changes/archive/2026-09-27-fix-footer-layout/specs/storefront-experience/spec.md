## ADDED Requirements

### Requirement: Responsive sticky footer and viewport container layout
The storefront layout SHALL establish a dynamic full-viewport column container using dynamic viewport units (`min-h-screen min-h-dvh` with flex column) ensuring that the `<main>` landmark expands to consume available vertical space. When page content is shorter than the viewport height, the footer SHALL anchor cleanly to the bottom of the viewport rather than floating midway up the screen. When content exceeds the viewport height, the footer SHALL remain positioned beneath the content with natural document scrolling.

#### Scenario: Short content or sparse routes
- **WHEN** a visitor navigates to a route with minimal content such as an empty cart, empty wishlist, or not-found page
- **THEN** the `<main>` landmark expands (`flex-1`) to fill the remaining vertical height and the footer anchors to the bottom of the viewport without unstyled voids beneath it

#### Scenario: Scrollable content pages
- **WHEN** a visitor views a catalog or product page whose content height exceeds the viewport height
- **THEN** the document scrolls naturally and the footer is pushed directly below the main content
