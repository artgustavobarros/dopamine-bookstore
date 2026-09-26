## Why

Dopamine Bookstore is an educational portfolio project simulating an impulsive bookstore. To maximize visibility across traditional search engines (SEO), conversational answer engines (AEO), and generative AI search systems (GEO like Google AI Overviews, ChatGPT Search, and Perplexity), the site needs comprehensive discoverability metadata and machine-readable context files (`robots.txt`, `sitemap.xml`, `llms.txt`, and structured schema.org markup). Crucially, these materials and on-page disclosures must explicitly confirm that Dopamine Bookstore is a demonstration/fictional marketplace where no actual payments occur.

In addition, fetching remote catalog items from Open Library should be cached for 1 hour to respect external rate limits and enhance responsiveness. Visually, the hero section's three featured books currently use colored red and blue placeholder blocks with title banners; they should instead display the actual book cover images styled with black accents/frames to provide a polished, authentic showcase.

## What Changes

- **SEO, AEO, and GEO discoverability**:
  - Add `public/robots.txt` granting access to major search and AI crawlers (Googlebot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Bingbot) and linking to `sitemap.xml` and `llms.txt`.
  - Add `public/sitemap.xml` listing primary localized canonical pages.
  - Add `public/llms.txt` and `/pricing.md` describing the project, its simulated nature, catalog structure, and zero-cost fictional pricing for AI agents.
  - Add structured schema.org JSON-LD markup (`WebSite`, `BookStore`, and `FAQPage`) confirming the site's identity as a simulation portfolio project and answering common questions regarding payments, shipping, and order simulation.
  - Enhance document `<head>` metadata in TanStack Router/Start with descriptive Open Graph, Twitter cards, meta descriptions, and canonical URLs clarifying the fictional nature of the store.
- **1-hour catalog caching**:
  - Configure TanStack Query's `staleTime` and `gcTime` for `catalogQuery` and `bookQuery` to 1 hour (3,600,000 ms), eliminating redundant Open Library API requests during a browsing session.
- **Hero featured books visual revamp**:
  - Replace the red (`bg-red`) and blue (`bg-blue`) placeholder blocks and book title text banners in the hero's 3 featured books with rendered book cover artwork from Open Library (or high-fidelity dark cover fallbacks), styled with clean black borders and offset shadows.

## Capabilities

### New Capabilities
- `seo-and-ai-discoverability`: Specifies meta tags, structured schema.org data, robots.txt, sitemap, and LLM context files that optimize organic and AI search engines while explicitly disclosing that the storefront is a simulation/fake marketplace.

### Modified Capabilities
- `storefront-experience`: Modifies the hero featured book presentation to display rendered book cover artwork with black framing rather than solid red/blue background blocks and text title overlays.
- `remote-book-catalog`: Modifies remote query caching requirements to enforce a 1-hour stale and retention time for catalog and book detail queries.

## Impact

- **Affected code**:
  - `src/routes/__root.tsx`: Document head tags, SEO meta, Open Graph, and JSON-LD schema injection.
  - `src/routes/index.tsx`: Hero featured book presentation and markup.
  - `src/lib/open-library.ts`: TanStack Query cache configuration (`staleTime` and `gcTime` updated to 1 hour).
  - `public/`: Addition of `robots.txt`, `sitemap.xml`, `llms.txt`, and `pricing.md`.
  - `src/lib/i18n.ts`: Any localized strings for SEO/schema or hero cover alt labels.
- **Dependencies**: No external runtime dependencies required; uses existing React 19, TanStack Router, and TanStack Query.
- **APIs**: Reduces load on Open Library's public API through 1-hour client query caching.
