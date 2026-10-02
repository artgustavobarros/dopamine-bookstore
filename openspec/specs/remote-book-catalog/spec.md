# remote-book-catalog Specification

## Purpose
Fetch language-specific Open Library works, render public catalog content, and cache results for responsive browsing.

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

### Requirement: Lightweight native fetch client for Open Library
The application SHALL use standard runtime `fetch` with `AbortSignal` timeouts and URL parameter construction for all Open Library API queries, eliminating external HTTP client library dependencies.

#### Scenario: Catalog search with native fetch
- **WHEN** the application searches Open Library for books in the active language
- **THEN** it sends requests via standard `fetch` with configured timeouts and query parameters
- **AND** validates responses using the existing Zod schemas without depending on `axios`

### Requirement: Server-rendered initial public catalog content
The homepage SHALL include a bounded default catalog in its initial HTML and hydrate the same records into the client query cache. A public book detail route SHALL render a resolved book's title and author in initial HTML. The application SHALL bound upstream request time and reuse cached results so server rendering does not multiply Open Library requests on every visit.

#### Scenario: Crawl homepage without JavaScript
- **WHEN** a crawler reads the homepage HTML without running JavaScript
- **THEN** it finds the default catalog's book links and visible titles

#### Scenario: Hydrate homepage
- **WHEN** a browser hydrates a server-rendered homepage
- **THEN** the initial catalog remains visible and hydration does not immediately repeat the same Open Library request

#### Scenario: Crawl available book
- **WHEN** a crawler reads a valid book detail URL without running JavaScript
- **THEN** the HTML contains that book's title and author

#### Scenario: Upstream book unavailable
- **WHEN** the requested work is invalid, absent, or lacks the selected-language edition
- **THEN** the route renders a truthful unavailable/not-found state that is not indexable as an empty product page
