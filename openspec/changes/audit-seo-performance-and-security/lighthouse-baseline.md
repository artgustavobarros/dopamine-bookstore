# Production mobile Lighthouse baseline

URL: `https://dopamine-bookstore.vercel.app/`  
Date: 2026-10-02  
Command: `CHROME_PATH=/home/arthur/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome pnpm dlx lighthouse@latest https://dopamine-bookstore.vercel.app/ --chrome-flags='--headless=new --no-sandbox --disable-dev-shm-usage' --only-categories=performance,seo,best-practices --form-factor=mobile --output=json --output-path=<path> --quiet`

| Run | Performance | SEO | FCP | LCP | TBT | CLS | Document response |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 83 | 92 | 2.92 s | 2.99 s | 230 ms | 0 | 35 ms |
| 2 | 68 | 92 | 1.09 s | 5.31 s | 352 ms | 0.117 | 36 ms |
| 3 | 87 | 92 | 2.80 s | 2.88 s | 155 ms | 0 | 35 ms |
| Median | 83 | 92 | 2.80 s | 2.99 s | 230 ms | 0 | 35 ms |

First run details: hero badge was the LCP element with 1.43 s render delay; initial `index` and `store` chunks transferred 151 and 103 KiB; Lighthouse estimated 107 KiB of unused JavaScript, 410 ms render-blocking savings, and 51 KiB image-delivery savings. `robots.txt` failed because `Sitemap: /sitemap.xml` is not an absolute URL.

These are lab measurements. The PageSpeed Insights API returned HTTP 429 during collection; no CrUX field data is asserted here.

## Local production-build verification

Built with `pnpm build` and served using `pnpm preview`. A local Brotli proxy compressed HTML/CSS/JavaScript to approximate the compression used by Vercel; Lighthouse used the same mobile settings above, changing only the URL to `http://127.0.0.1:4176/`. This is a local build, not the currently deployed site.

| Run | Performance | SEO | FCP | LCP | TBT | CLS | Document response audit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 97 | 100 | 1.12 s | 1.27 s | 16 ms | 0.00006 | 2,282 ms (cold catalog) |
| 2 | 96 | 100 | 2.14 s | 2.29 s | 22 ms | 0 | 72 ms |
| 3 | 96 | 100 | 2.14 s | 2.36 s | 15 ms | 0 | 70 ms |
| Median | 96 | 100 | 2.14 s | 2.29 s | 16 ms | 0 | 72 ms |

The LCP element is now the third hero cover. It is preloaded with `fetchpriority=high`; the three known featured covers use local WebP files totaling about 22 KB instead of about 62 KB of external JPEGs. The mobile Lighthouse checklist reports that the LCP request is discoverable, eager, and high priority. `robots.txt` passes and the SEO category scores 100 locally. The display font is also preloaded: comparison of the baseline and final Lighthouse screenshots confirmed the bold heading and hero composition remain visible on mobile.

The first server response audit hit a cold Open Library catalog fetch (2.28 s), while warm responses were about 70 ms versus 35 ms on the old production baseline. Per-instance server caching cannot guarantee a warm first request after a new serverless instance starts; this remains a production risk until the deployed build is measured. Lighthouse's document-response audit and simulated paint timings are separate measurements, so the first-row response time should not be compared directly to its FCP.

For transparency, the uncompressed Nitro preview scored 77–78 in three runs with LCP around 4.1 s. The compression proxy changes the transfer profile substantially. The deployed Vercel build was measured separately after publication; the production baseline above describes the old deployment.

## Deployed production verification

Deployment: `2290857c0258a866602c7c16eb2170871aeb2bda` (`Ready`), served at `https://dopamine-bookstore.vercel.app/` on 2026-10-02. The same mobile Lighthouse command and categories as the baseline were used for three independent runs.

| Run | Performance | SEO | Best practices | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 1.23 s | 1.38 s | 61 ms | 0 |
| 2 | 97 | 100 | 100 | 1.09 s | 1.09 s | 14 ms | 0.00006 |
| 3 | 77 | 100 | 100 | 2.80 s | 4.21 s | 18 ms | 0 |
| Median | 97 | 100 | 100 | 1.23 s | 1.38 s | 18 ms | 0 |

The deployed median meets the 90 performance, 2.5 s LCP, 200 ms TBT, and 0.1 CLS budgets. Compared with the old production median, performance rose from 83 to 97, SEO from 92 to 100, LCP fell from 2.99 s to 1.38 s, and TBT from 230 ms to 18 ms. Run 3 had a 2.14 s LCP element render delay, showing lab variability; its LCP image was still the high-priority local WebP cover. The homepage returned server-rendered catalog content and valid JSON-LD; `robots.txt` points to an absolute sitemap URL; a real catalog book had server-rendered title and canonical; personal routes and an invalid book had `noindex` with no canonical. `OL100W` is a local test fixture, not a real Open Library ID.

The Vercel project currently has no Upstash limiter settings, so Gemini requests take the documented deterministic fallback path. This avoids an unmetered paid provider call while the shared quota store is absent. Local demo registration does not call a server endpoint or store a password.
