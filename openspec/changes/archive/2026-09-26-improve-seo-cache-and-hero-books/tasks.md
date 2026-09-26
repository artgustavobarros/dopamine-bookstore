## 1. Machine-Readable SEO and AI Discovery Files

- [x] 1.1 Create `public/robots.txt` allowing search bots and AI crawlers (Googlebot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Bingbot) and linking to `sitemap.xml` and `llms.txt`.
- [x] 1.2 Create `public/sitemap.xml` mapping canonical routes (`/`, `/wishlist`, `/orders`, `/stats`, `/cart`, `/account`).
- [x] 1.3 Create `public/llms.txt` and `public/pricing.md` detailing the application structure, technical stack, zero-cost simulated pricing, and confirming it is a fictional demo marketplace.

## 2. Meta Tags, Structured Schema, and Storefront Disclosures

- [x] 2.1 Add Open Graph, Twitter card, canonical, and descriptive meta tags to `src/routes/__root.tsx` confirming the store is an imaginary / demonstration bookstore.
- [x] 2.2 Add structured JSON-LD schema markup (`WebSite`, `BookStore`, and `FAQPage`) to `src/routes/__root.tsx` answering common questions and explicitly declaring simulated transactions.
- [x] 2.3 Verify and refine bilingual storefront disclosures (announcement bar, hero badge, footer) confirming that Dopamine Bookstore is a fake/demonstration marketplace.

## 3. Remote Catalog 1-Hour Caching

- [x] 3.1 Update `catalogQuery` in `src/lib/open-library.ts` with 1-hour `staleTime` and `gcTime` (3,600,000 ms).
- [x] 3.2 Update `bookQuery` in `src/lib/open-library.ts` with 1-hour `staleTime` and `gcTime` (3,600,000 ms).

## 4. Hero Featured Books Cover Artwork

- [x] 4.1 Update the 3 featured book elements in `src/routes/index.tsx` to display book cover artwork instead of solid `bg-red` and `bg-blue` fills and book title text banners.
- [x] 4.2 Apply black styling, dark fallback containers, and translated offset rotations to the featured hero book cards while preserving interactive motion.

## 5. Verification and Quality Assurance

- [x] 5.1 Run route generation and TypeScript typechecking (`pnpm run typecheck`).
- [x] 5.2 Run code formatting and lint verification (`pnpm run lint`).
- [x] 5.3 Run Playwright storefront tests (`pnpm run test:e2e`).
