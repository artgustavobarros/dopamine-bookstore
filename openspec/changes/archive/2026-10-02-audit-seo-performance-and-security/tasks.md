## 1. Baseline and crawler correctness

- [x] 1.1 Save reproducible mobile Lighthouse settings and record three production-build baseline runs for homepage, including FCP, LCP element/subparts, TBT, CLS, initial transferred JS, and TTFB.
- [x] 1.2 Make `robots.txt` use an absolute HTTPS sitemap URL and verify Lighthouse no longer reports `Invalid sitemap URL`.
- [x] 1.3 Remove local-personal URLs from `sitemap.xml`, add route-specific canonical/noindex policies, and verify them in raw HTML for home, book, registration, cart, checkout, account, orders, tracking, wishlist, stats, and completion routes.
- [x] 1.4 Give book detail pages server-rendered title, description, social URL, and canonical metadata; make invalid/unavailable work pages non-indexable.
- [x] 1.5 Reconcile `WebSite`, `BookStore`, and FAQ JSON-LD with visible content and validate rendered markup with a schema validator or Rich Results Test.

## 2. Server-rendered catalog and mobile performance

- [x] 2.1 Add bounded server prefetch/cache for the default catalog and book lookup, with timeout, deduplication, and upstream error handling.
- [x] 2.2 Hydrate default catalog/book data into TanStack Query so HTML contains public content and the browser does not immediately refetch it; verify with JavaScript disabled and network inspection.
- [x] 2.3 Keep hero text visible before GSAP starts and preserve decorative motion only after first render; verify reduced-motion behavior and LCP element timing.
- [x] 2.4 Inspect the initial bundle, defer optional roast/animation code and route-only imports, and reduce unused homepage JavaScript without regressing interactions.
- [x] 2.5 Reduce critical font/CSS requests and right-size the three hero covers while retaining fixed dimensions and a no-cover fallback.
- [x] 2.6 Run three mobile Lighthouse checks on the same production build and meet the performance budgets; compare TTFB and screenshots against baseline.

## 3. Browser-local demo identity

- [x] 3.1 Remove password and confirmation inputs from registration/sign-in/profile flows and label profiles clearly as local demo data.
- [x] 3.2 Bump Zustand persistence version and migrate legacy users by stripping plaintext passwords without losing cart, wishlist, orders, reviews, or profile records.
- [x] 3.3 Test fresh registration, same-device profile selection, validated `returnTo`, checkout/review demo gating, and migration from a saved legacy fixture.

## 4. Real server-side abuse controls

- [x] 4.1 Bound all client-controlled Gemini input fields (string lengths, array sizes, counts, numbers) before prompt construction and add oversized-payload tests.
- [x] 4.2 Implement an atomic shared per-client limiter with separate roast and diagnosis budgets, trusted client-IP extraction, privacy-preserving keys, and deterministic fallback when limits or infrastructure fail.
- [x] 4.3 Cap roast cache size/TTL, coalesce duplicate in-flight calls, and remove prompt or personal data from logs.
- [x] 4.4 Test quotas across two server instances or equivalent shared-store clients, limiter outages, cache eviction, and provider failure without invoking Gemini above budget.
- [x] 4.5 Document required limiter environment variables and the explicit fallback-only production mode when the shared store is absent.

## 5. Regression checks

- [x] 5.1 Run typecheck, build, relevant Playwright flows, and a source-only React Doctor scan; manually triage the two existing errors and fix confirmed checkout updater side effects or loading-state bugs touched by this change.
- [x] 5.2 Verify Lighthouse SEO score and crawler HTML in the deployed build, and compare final mobile medians with the documented baseline.
