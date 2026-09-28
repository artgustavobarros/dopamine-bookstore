## ADDED Requirements

### Requirement: Comprehensive Project Overview and Satirical Concept Documentation
The `README.md` file SHALL describe the project concept, purpose, and satirical premise (book hoarding / tsundoku, zero-cost simulated transactions, dopamine checkout, and psychological roasts) while establishing the application's educational portfolio role.

#### Scenario: Reader learns project scope and intent
- **WHEN** a developer, evaluator, or visitor reads the introduction of `README.md`
- **THEN** they clearly understand that the project is a simulated bookstore celebrating and satirizing tsundoku with zero real financial transactions and zero real shipping.

### Requirement: Detailed Performance Engineering Documentation
The `README.md` file SHALL document the explicit performance decisions implemented in the project, including:
1. Full-stack SSR and bundler configuration with TanStack Start, Nitro, and Vite.
2. Network and data fetching optimizations (TanStack Query 1-hour stale/gc time, request spacing slot queue of 1.1s, query debouncing of 700ms, field projection, and `AbortSignal.timeout`).
3. Core Web Vitals and image optimization (native `loading="lazy"`, explicit dimensions, `aspect-[3/4]` containers preventing CLS, typographic fallback covers).
4. Asset performance (self-hosted fonts via `@fontsource` eliminating third-party blocking network calls).
5. Animation performance (GSAP with `withMotion`, `prefers-reduced-motion` detection, fine pointer media queries, and `quickTo` physics).
6. Serverless AI performance (TanStack Start server functions, in-memory roast caching, tight timeouts, model cascade, and instant catalog fallbacks).
7. Client state management (Zustand with SSR-safe `safeStorage` and selector-based rendering).

#### Scenario: Engineer reviews performance design
- **WHEN** an engineer evaluates the performance section in `README.md`
- **THEN** they find concrete explanations and architectural patterns for how the app avoids rate limits, prevents CLS, minimizes network payloads, optimizes 60/120fps animations, and accelerates AI generation.

### Requirement: Modern SEO and AI Discoverability Documentation
The `README.md` file SHALL document the SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) strategies implemented in the project, including:
1. Semantic and structured data via JSON-LD (`WebSite`, `BookStore`, `FAQPage` schemas) with `@graph`.
2. Meta tags, canonical URLs, Open Graph, and Twitter Cards.
3. Crawler configuration in `public/robots.txt` supporting search bots and conversational AI agents (GPTBot, PerplexityBot, ClaudeBot, etc.) while blocking scrapers.
4. AI context integration via `public/llms.txt` and `public/pricing.md`.
5. Canonical XML sitemap (`public/sitemap.xml`).

#### Scenario: Evaluator inspects discoverability and search optimization
- **WHEN** an evaluator reads the SEO and AI Discoverability section in `README.md`
- **THEN** they see an explanation of how the site optimizes both traditional search engine indexing and AI answer engine citations while preventing LLM hallucinations about purchase capabilities.

### Requirement: Accurate Project Structure and Developer Workflow
The `README.md` file SHALL provide an accurate directory structure map (reflecting actual files and removing deprecated references such as Axios), complete environment variable setup (`GEMINI_API_KEY`), and clear verification commands (`check`, `typecheck`, `build`, `test:e2e`).

#### Scenario: Contributor runs and tests the project
- **WHEN** a contributor follows the Getting Started and Verification guides in `README.md`
- **THEN** they have exact commands to install dependencies, run the development server, configure environment variables, execute type-checking, run Biome/Ultracite linting, and run Playwright E2E tests.
