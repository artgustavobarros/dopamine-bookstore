## ADDED Requirements

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
