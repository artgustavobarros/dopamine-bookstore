## MODIFIED Requirements

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
