## ADDED Requirements

### Requirement: Lightweight native fetch client for Open Library
The application SHALL use standard runtime `fetch` with `AbortSignal` timeouts and URL parameter construction for all Open Library API queries, eliminating external HTTP client library dependencies.

#### Scenario: Catalog search with native fetch
- **WHEN** the application searches Open Library for books in the active language
- **THEN** it sends requests via standard `fetch` with configured timeouts and query parameters
- **AND** validates responses using the existing Zod schemas without depending on `axios`
