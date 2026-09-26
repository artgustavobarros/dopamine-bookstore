## Context

Dopamine Bookstore is a portfolio project built with Vite, React 19, TanStack Router/Start, TanStack Query, Tailwind CSS, and GSAP. The application pulls literature data from Open Library.

To optimize visibility in traditional search engines (SEO), answer engines (AEO), and generative AI platforms (GEO like ChatGPT, Perplexity, and Google AI Overviews), the site needs standard indexing files, agent context documents, meta tags, and structured data. Because the site is a humorous, educational demo, it is essential that all crawlers, agents, and human visitors receive clear confirmation that this is a simulated marketplace where zero real money is transacted.

Additionally, to optimize performance and respect Open Library's public API limits, query caching should be extended to 1 hour. In the hero section, the visual representation of the three featured books currently relies on solid colored cards (`bg-red` and `bg-blue`) with title text boxes; they should be updated to showcase actual book cover images with sleek black framing and offset positions.

## Goals / Non-Goals

**Goals:**
- Provide `public/robots.txt` allowing search crawlers and AI search bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot, Googlebot), pointing to `sitemap.xml` and `llms.txt`.
- Provide `public/sitemap.xml` with canonical routes (`/`, `/wishlist`, `/orders`, `/stats`, `/cart`, `/account`).
- Provide `public/llms.txt` and `public/pricing.md` explaining the project, technical stack, zero-cost fictional pricing, and demo status for AI agents.
- Embed rich structured JSON-LD schemas (`WebSite`, `BookStore`, `FAQPage`) and Open Graph/Twitter meta tags in `src/routes/__root.tsx` explicitly disclosing that this is a portfolio simulation / fake marketplace.
- Update `catalogQuery` and `bookQuery` in `src/lib/open-library.ts` to use a 1-hour `staleTime` and `gcTime` (3,600,000 ms).
- Update the hero section in `src/routes/index.tsx` so the 3 featured books display their cover images styled with black backgrounds and black borders (`border-[#141210]`, `bg-[#141210]`) instead of solid red and blue blocks and text title banners.

**Non-Goals:**
- Real payment processing or external payment gateways (the store remains strictly simulated).
- Replacing Open Library with proprietary book catalog databases.
- Modifying client-side shopping list, cart, or order persistence mechanisms.

## Decisions

### 1. AI-Friendly Robots & Machine-Readable Specs
- **Choice**: Add `robots.txt`, `sitemap.xml`, `llms.txt`, and `pricing.md` to `public/`.
- **Rationale**: Search and AI engines look for standard machine-readable files at the root domain. `llms.txt` and `pricing.md` allow LLMs and buying agents to understand the site structure and zero-dollar pricing without running JavaScript or scraping complex layouts.
- **Alternatives considered**: Only adding meta tags without root files (rejected because LLM agents frequently fetch `/llms.txt` and `/robots.txt` directly).

### 2. Comprehensive JSON-LD Schema & Meta Tags in Router Root
- **Choice**: Inject JSON-LD in `src/routes/__root.tsx` with `WebSite`, `BookStore`, and `FAQPage` schemas, plus Open Graph (`og:type`, `og:title`, `og:description`, `og:image`) and Twitter cards.
- **Rationale**: Injecting `FAQPage` schema directly answers queries like "Is Dopamine Bookstore real?" and "Are orders delivered?", ensuring AI answer engines cite the site's official disclaimer accurately.
- **Alternatives considered**: Separate schema component per route (rejected because the site is a single-page app structure where global identity schemas belong in the root document).

### 3. One-Hour Client Caching in TanStack Query
- **Choice**: Increase `staleTime` and `gcTime` in `catalogQuery` and `bookQuery` from 10m/30m to `60 * 60 * 1000` (1 hour).
- **Rationale**: Open Library catalog results do not fluctuate minute-by-minute. A 1-hour cache eliminates duplicate network calls when users switch routes or toggle filters back and forth.
- **Alternatives considered**: Persisting query cache to localStorage (unnecessary complexity since TanStack Query memory cache with 1-hour staleTime fulfills the requirement cleanly).

### 4. Hero Featured Books Visual Redesign
- **Choice**: In `src/routes/index.tsx`, replace the `bg-red` and `bg-blue` classes and `<strong ...>{book.title[locale]}</strong>` title boxes in the 3 featured book cards with actual cover artwork (`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` or cover component) using black background (`bg-[#141210]`) and black borders, preserving the playful tilt/rotation and hover interactions.
- **Rationale**: The user specifically requested to "show the image of the books translated with the black, instead bg-red and bg-blue and name of the books". Using black framing with the cover image creates a sophisticated contrast with the bright yellow and paper elements of the hero.
- **Alternatives considered**: Keeping the title text banner over the image (rejected because the user explicitly requested replacing the name of the books with the book cover images).

## Risks / Trade-offs

- **[Risk] Book cover images may fail to load or be missing in Open Library**
  → *Mitigation*: Provide an attractive black-and-gold or patterned fallback styling inside the book card container if `coverId` is null, and use `loading="lazy"` with proper dimensions.
- **[Risk] Search engines might misinterpret the store as a live e-commerce business**
  → *Mitigation*: Explicitly declare in all metadata, schema, and `llms.txt` that all books are simulated, checkout charges R$ 0.00, and no real transactions exist.
