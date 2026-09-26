# shopping-lists Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Wishlist management
The application SHALL let visitors add or remove a book from the wishlist from catalog and detail views, see all saved books, and move wishlist books to the cart without duplicate cart entries.

#### Scenario: Save and move a book
- **WHEN** a visitor saves a book and chooses to move wishlist items to the cart
- **THEN** the book appears once in the cart and is removed from the wishlist

### Requirement: Cart management and totals
The application SHALL let visitors add or remove books, prevent duplicate entries, and derive subtotal, page count, estimated reading hours, and former-price savings from the current cart.

#### Scenario: Add the same book twice
- **WHEN** a visitor adds a book already in the cart
- **THEN** the cart still contains one entry for that book and the total is unchanged

#### Scenario: Remove a cart item
- **WHEN** a visitor removes a book from the cart
- **THEN** the item disappears and all cart totals update immediately

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

