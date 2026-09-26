# remote-book-catalog Specification

## Purpose
TBD - created by archiving change replace-static-catalog-with-open-library. Update Purpose after archive.
## Requirements
### Requirement: Language-specific remote catalog
The application SHALL fetch a bounded catalog of Open Library works with an edition in the selected UI language, use the edition title where available, and identify each book by a stable work ID.

#### Scenario: Open the Portuguese catalog
- **WHEN** a visitor opens the catalog with Portuguese selected
- **THEN** the application requests Portuguese editions and displays returned books using Portuguese edition titles

#### Scenario: Switch the language
- **WHEN** a visitor changes between Portuguese and English
- **THEN** the application requests and displays data for the new language without presenting cached records from the previous language as translated records

### Requirement: Remote data states
The application SHALL distinguish loading, request failure, empty remote results, missing selected-language edition, and no local filter matches. Each state SHALL show an accessible explanation and relevant recovery action in the storefront's existing empty-state style.

#### Scenario: Request fails
- **WHEN** Open Library cannot be reached
- **THEN** a request-error state offers a retry action

#### Scenario: Selected edition absent
- **WHEN** a known work has no edition in the selected language
- **THEN** its detail route explains the language limitation and offers a way back to the catalog

### Requirement: Fictional prices independent of Open Library
The application SHALL display stable demonstration prices for remote works and clearly communicate that checkout charges zero.

#### Scenario: Same work fetched again
- **WHEN** a work is fetched on another visit or in another language
- **THEN** its demonstrated price remains the same

### Requirement: One-hour remote catalog caching
The application SHALL cache remote catalog search queries and individual book lookups in TanStack Query with a stale time and garbage collection lifetime of at least 1 hour (3,600,000 milliseconds). Re-visiting the catalog or book pages within that 1-hour window SHALL be satisfied from the client cache without issuing new network requests to Open Library unless manually re-fetched.

#### Scenario: Navigating back to catalog within 1 hour
- **WHEN** a visitor searches or navigates the catalog, views a book, and returns to the catalog within 60 minutes
- **THEN** previously fetched catalog records are served immediately from client cache without triggering an additional Open Library API request

#### Scenario: Book detail query within 1 hour
- **WHEN** a visitor views a book detail page that was previously fetched within the last 60 minutes
- **THEN** the book lookup is fulfilled immediately from cache without making a new network request

