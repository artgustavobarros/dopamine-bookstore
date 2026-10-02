## ADDED Requirements

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

