## ADDED Requirements

### Requirement: JSON-backed book catalog
The application SHALL load the initial 18-book catalog from a local JSON file. Each book SHALL have a stable ID, title, author, genre, year, page count, price, description, and optional former price, with localized text where supplied.

#### Scenario: View catalog
- **WHEN** a visitor opens the home route
- **THEN** the catalog displays the bundled books with title, author, genre styling, page count, price, and add/save actions

### Requirement: Search and filter books
The application SHALL filter books by a case- and accent-insensitive title/author search and by genre, price band, author, and page-length band. It SHALL show the result count and a useful empty state.

#### Scenario: Combined filters
- **WHEN** a visitor enters a title fragment and selects a genre
- **THEN** only books matching both conditions are displayed and the count updates

#### Scenario: No matching books
- **WHEN** search and filters match no book
- **THEN** the catalog shows a no-results message and a way to change or clear the criteria

### Requirement: Book details and sample reviews
The application SHALL provide a direct route for each book showing its description, metadata, estimated reading time, price, actions, and sample plus visitor reviews. Unknown book IDs SHALL show a not-found state.

#### Scenario: Open book detail
- **WHEN** a visitor opens a catalog book
- **THEN** its detail route displays the corresponding book and its reviews

#### Scenario: Unknown book
- **WHEN** a visitor opens a detail URL with an unknown book ID
- **THEN** the application shows a not-found message with a route back to the catalog

