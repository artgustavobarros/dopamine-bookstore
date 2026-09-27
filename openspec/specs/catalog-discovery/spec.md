# catalog-discovery Specification

## Purpose
TBD - created by archiving change build-dopamine-bookstore. Update Purpose after archive.
## Requirements
### Requirement: Search and filter books
The application SHALL search Open Library in the selected language by title or author text and filter the returned books by genre, price band, author, and page-length band. The catalog search input SHALL NOT display an inert, non-functional genre button adjacent to the input field, relying instead on the interactive genre selectors in the catalog filter section. It SHALL show the result count and a useful empty state.

#### Scenario: Clean search input without inert genre badge
- **WHEN** a visitor views the catalog search bar
- **THEN** the search input field is rendered without an adjacent non-functional "Gênero" decorative badge

#### Scenario: Combined filters
- **WHEN** a visitor enters a search term and selects a genre
- **THEN** only remote results matching the selected language and local filters are displayed and the count updates

#### Scenario: No matching books
- **WHEN** search or filters match no book
- **THEN** the catalog shows a no-results message and a way to change or clear the criteria

### Requirement: Book details and sample reviews
The application SHALL provide a direct route for each Open Library work showing available metadata, estimated reading time where page count exists, a demonstration price, actions, and visitor reviews. Unknown work IDs SHALL show a not-found state. A work lacking the selected-language edition SHALL show a distinct language-unavailable state.

#### Scenario: Open book detail
- **WHEN** a visitor opens a catalog book
- **THEN** its detail route displays the corresponding selected-language edition and its reviews

#### Scenario: Unknown book
- **WHEN** a visitor opens a detail URL with an unknown work ID
- **THEN** the application shows a not-found message with a route back to the catalog

#### Scenario: Missing language edition
- **WHEN** a visitor opens a known work without an edition in the selected language
- **THEN** the application explains that limitation without showing another language as a translation

### Requirement: Open Library book catalog
The application SHALL load its book catalog from Open Library instead of a bundled JSON list. Each displayed book SHALL have a stable work ID, a selected-language edition title, an author, and a demonstration price; optional metadata SHALL be shown only when available.

#### Scenario: View catalog
- **WHEN** a visitor opens the home route
- **THEN** the catalog loads remote book data and displays titles, authors, genre styling, available page counts, prices, and add/save actions

