## ADDED Requirements

### Requirement: One-hour remote catalog caching
The application SHALL cache remote catalog search queries and individual book lookups in TanStack Query with a stale time and garbage collection lifetime of at least 1 hour (3,600,000 milliseconds). Re-visiting the catalog or book pages within that 1-hour window SHALL be satisfied from the client cache without issuing new network requests to Open Library unless manually re-fetched.

#### Scenario: Navigating back to catalog within 1 hour
- **WHEN** a visitor searches or navigates the catalog, views a book, and returns to the catalog within 60 minutes
- **THEN** previously fetched catalog records are served immediately from client cache without triggering an additional Open Library API request

#### Scenario: Book detail query within 1 hour
- **WHEN** a visitor views a book detail page that was previously fetched within the last 60 minutes
- **THEN** the book lookup is fulfilled immediately from cache without making a new network request
