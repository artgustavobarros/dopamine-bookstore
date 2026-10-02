## Why

A mobile Lighthouse run against the deployed homepage on 2026-10-02 scored 83 for performance and 92 for SEO. The crawler configuration is invalid, key catalog content is fetched only after hydration, and the initial render spends substantial time on JavaScript, fonts, and hero animation. The apparent account registration is browser-local and stores plaintext passwords, while public AI server functions can consume paid quota without a shared abuse limit.

## What Changes

- Correct the sitemap directive and align indexability, canonical URLs, metadata, and sitemap entries with the actual public routes. Render meaningful catalog and book detail content in initial HTML when those pages are intended to be indexed.
- Establish measurable mobile performance budgets and reduce the initial route's unused JavaScript, render-blocking font/CSS work, and hero LCP delay. Preserve the existing visual design and reduced-motion behavior.
- **BREAKING**: Remove password collection and plaintext password persistence from the browser-local demo identity. Migrate existing local records by discarding saved passwords. Present the flow explicitly as a local demo profile, not a secure cross-device account. Since registration currently makes no server request, a registration rate limit cannot provide abuse protection; a real registration service would require a separate server-backed identity change.
- Add bounded input validation and a durable, server-enforced quota for the public Gemini-backed roast and diagnosis functions; retain deterministic fallbacks when requests are rejected or the provider fails. Bound the server cache.
- Verify the changes with Lighthouse on a production build, rendered-HTML SEO checks, abuse-limit tests, and a React Doctor scan focused on source files.

## Capabilities

### New Capabilities

- `storefront-performance`: Mobile loading, initial rendering, and repeatable performance budgets for public storefront pages.

### Modified Capabilities

- `seo-and-ai-discoverability`: Valid crawler files, route-specific indexability and metadata, and server-rendered public content.
- `remote-book-catalog`: Initial catalog and book data availability in server-rendered HTML, while retaining client caching and loading/error states.
- `demo-identity-and-reviews`: Passwordless, explicitly local demo profiles and safe migration of legacy persisted credentials.
- `ai-roast-generator`: Server-enforced request limits, bounded payloads/cache, and safe fallback on abuse rejection.

## Impact

- Likely code: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/books/$bookId.tsx`, `src/lib/open-library.ts`, `src/lib/store.ts`, `src/routes/register.tsx`, `src/routes/account.tsx`, `src/lib/server/roast.ts`, font imports, hero motion, and `public/robots.txt`/`public/sitemap.xml`.
- Requires a shared durable rate-limit store for serverless deployments if the AI limit is enforced across instances; deployment configuration and secret management must be documented.
- Existing local demo passwords are removed during migration. No real account registration endpoint or remote identity database is introduced by this change.
