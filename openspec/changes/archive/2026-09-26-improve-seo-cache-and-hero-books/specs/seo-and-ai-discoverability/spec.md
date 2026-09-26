## ADDED Requirements

### Requirement: Search and AI crawler access configuration
The application SHALL provide a `public/robots.txt` configuration that explicitly allows both traditional search engine crawlers (such as Googlebot, Bingbot) and conversational/generative AI search crawlers (including GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, and Google-Extended). It SHALL reference the canonical sitemap (`sitemap.xml`) and the LLM context file (`llms.txt`).

#### Scenario: AI crawler inspects robots.txt
- **WHEN** an AI crawler (e.g. GPTBot or PerplexityBot) requests `/robots.txt`
- **THEN** it receives explicit permission to crawl public indexable routes and finds links to `sitemap.xml` and `llms.txt`

### Requirement: Machine-readable context files for AI agents
The application SHALL provide a `public/llms.txt` and a `public/pricing.md` describing the Dopamine Bookstore application, its architecture, catalog endpoints, and explicit confirmation that this is an educational simulation/fictional marketplace with zero-cost demo transactions. It SHALL also provide a valid `public/sitemap.xml` indexing all canonical storefront routes.

#### Scenario: AI agent retrieves llms.txt
- **WHEN** an AI system fetches `/llms.txt`
- **THEN** it receives structured Markdown summarizing the project, available routes, tech stack, and clear statements that purchases and products are purely simulated

#### Scenario: AI agent evaluates pricing
- **WHEN** an AI buying or comparison agent reads `/pricing.md`
- **THEN** it parses structured information confirming all books carry zero actual cost (R$ 0.00 / $0.00) and no real monetary transactions take place

### Requirement: Simulation marketplace metadata and structured schema
The application SHALL embed structured JSON-LD schema markup and document `<head>` metadata (canonical URL, Open Graph, Twitter cards, meta descriptions) explicitly confirming that Dopamine Bookstore is a fictional marketplace and portfolio demonstration. The schema markup SHALL include `WebSite`, `BookStore`, and `FAQPage` schemas addressing questions regarding payments, shipping, and real-world order fulfillment.

#### Scenario: Search engine parses homepage structured data
- **WHEN** a search engine crawler or rich results tester analyzes the root HTML
- **THEN** it finds valid JSON-LD including `WebSite`, `BookStore`, and `FAQPage` schemas explicitly declaring the service as a demonstration bookstore with simulated orders

#### Scenario: Social crawler or agent reads meta tags
- **WHEN** a platform retrieves page `<head>` meta tags
- **THEN** `og:title`, `og:description`, `description`, and `twitter:description` clearly state that the store is an imaginary / demonstration bookstore with simulated checkout
