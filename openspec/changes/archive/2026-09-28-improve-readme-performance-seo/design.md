## Context

The repository "Depois Eu Leio" (Dopamine Bookstore) is a full-stack, satirical e-commerce portfolio demonstration built with TanStack Start, React 19, Vite, Nitro, Zustand, TanStack Query, and Google Gemini GenAI. The existing `README.md` is very brief (38 lines) and outdated in several areas (e.g. mentions Axios which was replaced by native `fetch`, omits Gemini AI integrations, and completely lacks coverage of the extensive performance engineering and SEO/AEO optimizations implemented across the codebase).

To serve as a standout software engineering portfolio artifact, the README must accurately explain the system's architecture, engineering trade-offs, performance choices, and modern search engine optimization (including AI/LLM discovery).

## Goals / Non-Goals

**Goals:**
- Provide a clear, engaging explanation of the project's concept, architecture, and satirical premises (zero-cost shopping, tsundoku hoarder therapy).
- Comprehensively document the deliberate performance engineering decisions across network, rendering, asset loading, animation physics, state management, and serverless AI.
- Comprehensively document the SEO and AEO (Answer Engine Optimization / Generative Engine Optimization) strategy, including JSON-LD structured schemas, AI bot crawling policies (`robots.txt`), and machine-readable context protocols (`llms.txt`, `pricing.md`, `sitemap.xml`).
- Correct legacy/inaccurate mentions in the current README (e.g. replace Axios with native `fetch` + `AbortSignal`).
- Detail development, environment configuration, type-checking, and testing procedures (Playwright E2E, Ultracite linting).

**Non-Goals:**
- Altering the runtime application code or altering existing SEO/performance implementations.
- Adding unrelated documentation files or bloating the repository with non-essential diagrams.

## Decisions

### 1. Document Structure & Hierarchical Layout
We organize the README into logical sections designed for quick scanning by recruiters, tech leads, and open-source contributors:
1. **Header & Concept Overview**: Badges, concise summary, satirical context (tsundoku, simulated dopamine checkout).
2. **Key Capabilities & Features**: Bilingual catalog (PT-BR/EN), simulated checkout, AI comic roast & clinical diagnosis, delivery tracking simulation, reading statistics.
3. **Architecture & Technology Stack**: React 19, TanStack Start (Nitro + Vite), TanStack Query, Zustand, Tailwind CSS v4, GSAP, `@google/genai`.
4. **Performance Engineering**:
   - *Network & API*: Open Library request spacing (1.1s slot queue), debounced queries (700ms), field projection, abort controllers (`AbortSignal.timeout`), and TanStack Query 1-hour cache.
   - *Core Web Vitals & Rendering*: Native lazy loading, explicit aspect ratios & dimensions to eliminate CLS, zero-shift typography fallback covers.
   - *Asset Optimization*: Self-hosted fonts via `@fontsource` (Work Sans Variable, Archivo Black, Space Mono, Bangers) removing third-party render-blocking CDN requests.
   - *Animation Performance*: GSAP with `useGSAP`, `withMotion` scoping, `prefers-reduced-motion` compliance, fine pointer media queries (`hover: hover and pointer: fine`), and `quickTo` GPU transitions.
   - *Full-Stack Serverless AI*: Server functions (`createServerFn`), in-memory roast caching (`serverRoastCache`), strict timeouts (2.5s/10s), model cascade fallback, and deterministic catalog offline fallback.
   - *Client State*: Zustand with `safeStorage` SSR guard and granular subscriber selectors.
5. **SEO & AI Discoverability (AEO / GEO)**:
   - JSON-LD Structured Data (`WebSite`, `BookStore`, `FAQPage`) with `@graph`.
   - Open Graph, Twitter cards, canonical tags, and robots directives.
   - Crawler policies in `robots.txt` welcoming AI answer engines (GPTBot, PerplexityBot, ClaudeBot) while restricting scrapers.
   - Machine-readable context files (`public/llms.txt`, `public/pricing.md`) to anchor LLM citation grounding and prevent purchase hallucinations.
   - XML Sitemap (`public/sitemap.xml`).
6. **Project Structure**: Clean map of relevant directories.
7. **Getting Started & Verification**: Prerequisites, setup, environment variables (`GEMINI_API_KEY`), running, linting, typechecking, and E2E testing.

*Alternative Considered*: Writing separate documentation files in `docs/`. *Rejected* because recruiters and GitHub visitors evaluate the root `README.md` first; key technical decisions should be visible immediately.

### 2. Language & Tone
The README will be written in technical English with Brazilian Portuguese localization context (acknowledging BRL currency, ViaCEP, Brazilian literature, and bilingual UI). This aligns with standard international engineering portfolio practices while highlighting the localized product design.

## Risks / Trade-offs

- **[Risk: Maintenance Drift between README and Codebase]** → *Mitigation*: Ensure all documented functions, packages, and configuration parameters match existing files (`src/lib/open-library.ts`, `src/lib/server/roast.ts`, `package.json`, `src/routes/__root.tsx`).
- **[Risk: Information Overload]** → *Mitigation*: Use structured formatting (tables, bullet points, callout blocks) to ensure readability and quick scanning.
