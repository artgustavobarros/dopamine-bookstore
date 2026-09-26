## MODIFIED Requirements

### Requirement: Persistent browser lists
The application SHALL restore cart and wishlist entries with their saved remote-book snapshots from local storage after reload and SHALL keep the store usable if saved data is invalid or storage is unavailable. A book SHALL remain in saved lists when it falls outside the latest remote catalog results.

#### Scenario: Reload saved lists
- **WHEN** a visitor adds a remote book to the cart and another to the wishlist, then reloads
- **THEN** both lists are restored with readable book details and stable demonstration prices

#### Scenario: Catalog changes
- **WHEN** a saved work is absent from the latest catalog page or lacks an edition in the selected language
- **THEN** the cart or wishlist still displays its saved snapshot and informs the visitor if the title is shown in a different language

#### Scenario: Invalid saved list
- **WHEN** local storage contains unknown book IDs or malformed saved state
- **THEN** the store ignores invalid entries and remains usable
