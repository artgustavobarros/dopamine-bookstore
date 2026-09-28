## Why

The current `README.md` provides only a basic overview of "Depois Eu Leio", omitting the architectural depth, deliberate performance engineering choices, and comprehensive SEO / AI search engine optimization (AEO/GEO) features implemented across the application. As a portfolio project, the repository documentation needs to accurately highlight these technical decisions, architectural patterns (React 19, TanStack Start, Nitro, Zustand, GSAP), and optimization strategies for recruiters, engineers, and contributors.

## What Changes

- Overhaul `README.md` to comprehensively describe the project, its satirical premise, and its full-stack architecture.
- Document performance engineering decisions in detail:
  - TanStack Start + Nitro server-side rendering and code splitting.
  - TanStack Query client caching, query abort signals, payload field projection, and rate limiting (1.1s slot spacing) for Open Library API.
  - Image optimization (native `loading="lazy"`, explicit dimensions to prevent CLS, aspect ratio containers, adaptive sizing `-M` vs `-L`).
  - Font optimization using self-hosted `@fontsource` packages eliminating third-party blocking network calls.
  - GSAP physics and motion orchestration with `withMotion`, `prefers-reduced-motion` detection, and fine pointer guards.
  - Server function performance with `@google/genai`, server-side in-memory caching, aggressive timeouts, model cascade, and instant catalog fallbacks.
  - Zustand state persistence with `safeStorage` SSR guard and granular selectors.
- Document SEO, AEO (Answer Engine Optimization), and LLM discoverability:
  - Structured JSON-LD schema (`WebSite`, `BookStore`, `FAQPage`) with `@graph` clarifying fictional marketplace boundaries.
  - Meta tags, Open Graph, Twitter Cards, and canonical URL definitions.
  - Custom `public/robots.txt` supporting standard search engines and AI crawlers (GPTBot, PerplexityBot, ClaudeBot, etc.) while blocking scrapers.
  - Machine-readable context files: `public/llms.txt` and `public/pricing.md`.
  - Canonical XML sitemap (`public/sitemap.xml`).
- Include practical development, testing, environment configuration, and verification commands.

## Capabilities

### New Capabilities

- `project-documentation`: Comprehensive documentation standards for the repository README detailing project overview, technical architecture, performance engineering choices, SEO/AEO features, and developer workflow.

### Modified Capabilities

None. Existing system requirements and runtime behaviors remain unchanged.

## Impact

- Documentation: `README.md` is updated.
- Code/Runtime: Zero breaking changes or runtime code modifications.
