## Context

The deployed homepage was measured on 2026-10-02 with Lighthouse mobile: performance 83, SEO 92, best practices 100, FCP 2.9 s, LCP 3.0 s, TBT 230 ms, CLS 0. The LCP was the hero badge; its render delay was 1.43 s. Lighthouse estimated 107 KiB of unused initial JavaScript, 410 ms of render-blocking work (main stylesheet), and 51 KiB of avoidable hero-image transfer. The build emits 462.84 kB and 278.71 kB uncompressed for the initial `index` and `store` chunks. These are lab measurements, not CrUX field data; PageSpeed API returned 429 during this audit.

The HTML for `/books/OL45804W` has no H1 or book content before client execution. The root head supplies the homepage canonical to every route. The sitemap lists account/cart/orders/wishlist/stats pages whose main content is local or private, and `robots.txt` uses `Sitemap: /sitemap.xml`, which Lighthouse rejects as an invalid sitemap URL. Registration is entirely within Zustand `localStorage`, with a plaintext password in `users`. The Gemini server functions are public, validate shape but impose no useful length/batch limits or shared quota, and keep an unbounded in-memory cache.

React Doctor source-only scan reported score 47 with 35 diagnostics (2 errors, 33 warnings). The full-root scan also inspected generated `.output` and produced dependency false positives; source findings need manual triage. In particular, inspect checkout updater side effects and verify the timer cleanup warning in `StoreLayout` before changing working behavior.

## Goals / Non-Goals

**Goals:**
- Make public crawler signals consistent and public detail content visible in initial HTML.
- Improve mobile initial loading with a measured production-build baseline and regression budget.
- Remove the misleading password-based local sign-in and erase persisted plaintext secrets during migration.
- Protect the actual paid resource, Gemini, with shared quotas and bounded work.
- Preserve the fictional storefront experience, client search, and deterministic AI fallback.

**Non-Goals:**
- Building real accounts, remote order storage, or charging payments.
- Claiming a local demo profile provides authentication or access control against the device owner.
- Bulk-indexing the entire remote Open Library catalog or introducing locale URL trees.
- Fixing every low-priority React Doctor maintainability warning in this change.

## Decisions

### SEO and rendering

Use a full absolute sitemap URL in `robots.txt`. Keep only canonical public URLs in the sitemap. Set `noindex,follow` on local-personal pages (`/account`, `/register`, `/cart`, `/checkout`, `/orders`, tracking, `/wishlist`, `/stats`) and the completion flow. Give the homepage and resolvable book-detail pages self-canonical URLs with route-specific title, description, and social URL. Remove FAQ JSON-LD unless the same FAQ text is visible in page content; retain truthful `WebSite` and demo `BookStore` schema. Validate JSON-LD in a rendered page and Rich Results Test.

For the homepage, load a bounded default catalog on the server and dehydrate it into TanStack Query so the browser reuses the result. For book details, load the selected work in the route loader and render title, author, and cover server-side. Search/filter interactions remain client-side. Cache the default catalog and book lookups at the server or CDN with a bounded TTL and request coalescing to avoid increasing Open Library traffic. Invalid or unavailable work IDs must render a true not-found or `noindex` response rather than an indexable empty page. This is preferable to adding client-side metadata after load, which crawlers may not reliably see.

### Mobile performance

Keep above-the-fold hero text visible in the first paint; restrict entrance animation to decorative elements after the page is usable. Split optional GSAP/roast logic from the initial storefront path where practical, and avoid loading route-specific modules or all catalog jokes before interaction. Inspect bundle composition before replacing packages. Retain only font subsets/styles needed on the home critical path, preload at most the critical display font, and use `font-display: swap` or equivalent. Avoid broad CSS edits that change visual identity. Use responsive image sizes or an image transformation cache for the three hero covers, with dimensions and an acceptable Open Library fallback. Re-run Lighthouse mobile three times on the same production build and compare medians, because one score is noisy.

### Identity and security

The profile remains a local demo identity. Remove password and confirmation fields from registration/sign-in and any password comparison in the store. Bump persistence version and migrate existing records by deleting their password properties before writing the new state; also scrub legacy storage on startup. Explain near the form that profiles and example addresses live on this device and are not secure accounts. Keep checkout/review gating as a demo UI rule, not a security boundary. Do not add a client-only registration cooldown and call it a rate limit: there is no registration server endpoint to protect.

For Gemini server functions, require bounded strings, counts, arrays, and numeric ranges in the Zod input before prompt creation. Use a shared atomic rate-limit store keyed by a privacy-preserving digest of a trusted platform client IP, with separate budgets for short roasts and longer diagnoses. Initial budgets: 20 roasts per 10 minutes and 3 diagnoses per hour per client; make thresholds configurable. Reject over-quota provider calls with the existing deterministic fallback. When the shared store is unavailable or unconfigured in production, skip Gemini and serve fallback, so a deployment cannot silently run without an enforceable quota. Cap the response cache at 500 entries with a 15-minute TTL and prevent concurrent duplicate provider calls. Avoid logging prompts, addresses, or full model output. This targets actual billable abuse; an in-memory per-instance counter would reset on serverless cold starts.

### React Doctor triage

Use the installed React Doctor skill/CLI against `src` and review high-severity findings manually. Fix confirmed checkout state-updater side effects and loading-state bugs relevant to this change. Document false positives such as an effect whose cleanup is already present. Check the source score for regressions after implementation; it is not a PageSpeed score.

## Risks / Trade-offs

- Server-side Open Library requests can worsen TTFB or hit rate limits → bound timeouts, cache/coalesce, render a truthful error or noindex state, and compare TTFB in the same Lighthouse run.
- A shared limiter adds deployment configuration → production without it uses deterministic AI only; test quota failure and recovery.
- Password removal changes the demo sign-in flow → explain it in UI and migrate the local store without dropping cart/orders.
- Font or animation changes may alter the visual feel → compare screenshots and respect reduced motion.
- Public book metadata changes with the external catalog → only index resolvable book pages and avoid a speculative all-books sitemap.

## Migration Plan

1. Record Lighthouse mobile and rendered HTML baselines on a production build, plus the source-only React Doctor report.
2. Ship SEO and performance changes; verify canonicals, noindex directives, structured data, and Lighthouse medians before deployment.
3. Ship local-store migration that strips passwords while retaining non-secret demo state; test old version fixtures and a fresh registration flow.
4. Configure the shared limiter before enabling Gemini in production; otherwise keep deterministic fallback active. Test multi-instance quota behavior and provider outages.
5. Roll back application code if needed; the password scrub is intentionally irreversible, while local demo profiles remain recoverable by email.

## Open Questions

- Which managed shared store is available in the deployment environment for atomic quotas? The implementation can use a Redis-compatible service; no vendor credentials are currently in the repository.
- Are Search Console field data or a specific PageSpeed report URL available? Those would confirm whether the lab findings match real-user LCP/INP and identify additional routes to prioritize.
