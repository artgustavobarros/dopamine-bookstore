## MODIFIED Requirements

### Requirement: Search and AI crawler access configuration
The application SHALL provide a valid `public/robots.txt` that allows traditional search and permitted AI crawlers to fetch public pages, references the canonical sitemap with an absolute HTTPS URL, and references `llms.txt` in a human-readable comment. It SHALL not use robots disallow rules as a substitute for `noindex` on local-personal pages.

#### Scenario: Crawler inspects robots.txt
- **WHEN** a crawler requests `/robots.txt`
- **THEN** it receives parseable rules, an absolute canonical sitemap URL, and a reference to `/llms.txt`

### Requirement: Machine-readable context files for AI agents
The application SHALL provide `public/llms.txt` and `public/pricing.md` describing the fictional storefront, and a valid `public/sitemap.xml` containing only canonical, indexable public URLs. Local-personal routes and unresolved book detail URLs SHALL not appear in the sitemap.

#### Scenario: AI agent retrieves llms.txt
- **WHEN** an AI system fetches `/llms.txt`
- **THEN** it receives structured Markdown summarizing the project, available public routes, technology, and the fact that purchases are simulated

#### Scenario: AI agent evaluates pricing
- **WHEN** an AI buying or comparison agent reads `/pricing.md`
- **THEN** it finds that no real payment or physical fulfillment occurs

#### Scenario: Crawler reads sitemap
- **WHEN** a crawler requests `/sitemap.xml`
- **THEN** every listed URL is canonical, returns public indexable content, and excludes account, registration, cart, checkout, order, tracking, wishlist, and statistics pages

### Requirement: Simulation marketplace metadata and structured schema
The application SHALL render truthful JSON-LD and document metadata in initial HTML. The homepage SHALL use a self-referencing canonical and `WebSite`/demo `BookStore` schema. FAQ schema SHALL be present only when its questions and answers are visible on that page. Each indexable book detail page SHALL render its own canonical URL, title, description, and social URL. Personal and transactional pages SHALL render `noindex,follow`.

#### Scenario: Search engine parses homepage
- **WHEN** a crawler receives the homepage HTML
- **THEN** it finds a homepage canonical, truthful demo metadata, and structured data matching visible content

#### Scenario: Search engine parses a book page
- **WHEN** a crawler receives an available book detail URL without executing JavaScript
- **THEN** it finds the book title and content, a book-specific title and description, and a self-referencing canonical

#### Scenario: Search engine parses a personal page
- **WHEN** a crawler receives a cart, account, checkout, orders, tracking, wishlist, statistics, or registration page
- **THEN** it finds `noindex,follow` and does not find a homepage canonical presented as that route's canonical

