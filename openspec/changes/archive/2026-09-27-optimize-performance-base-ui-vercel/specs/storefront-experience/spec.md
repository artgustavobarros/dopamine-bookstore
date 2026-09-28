## ADDED Requirements

### Requirement: Base UI headless primitives for navigation drawer and button
The application SHALL use `@base-ui-components/react` headless primitives for modal/drawer dialogs and interactive button composition, maintaining full keyboard accessibility, focus trapping, and ARIA attributes without Radix UI runtime dependencies.

#### Scenario: Mobile drawer navigation with Base UI
- **WHEN** a visitor activates the mobile hamburger menu button
- **THEN** the navigation drawer opens using `@base-ui-components/react/dialog`, displays all navigation links, traps focus, and supports closing via escape key, close button, or overlay click
- **AND** the drawer maintains neobrutalist borders, paper palette, and GSAP transition effects

#### Scenario: Composable button with router links
- **WHEN** a button is rendered as a router link using `asChild` composition
- **THEN** the component merges attributes and styles cleanly onto the child anchor element without throwing runtime React warnings
