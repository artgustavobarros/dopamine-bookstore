## MODIFIED Requirements

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
