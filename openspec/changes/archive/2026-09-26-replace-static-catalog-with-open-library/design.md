## Context

The catalog module imports 18 JSON records synchronously. Home, detail, cart, wishlist, checkout, and the persisted Zustand store all assume those records are always present. The existing language switch changes UI copy and indexes bilingual fields. Open Library search returns work records with a preferred matching edition; `lang=pt|en` only affects ranking, while `language:por|eng` in `q` requires an edition in that language.

## Goals / Non-Goals

**Goals:** Live Portuguese and English bibliographic data, no owned API or key, explicit async states, stable saved lists, and the current fictional checkout.

**Non-Goals:** Real retail prices, stock, payment, guaranteed translations of descriptions, a complete Open Library mirror, or an API server.

## Decisions

1. Use the public Open Library Search API with Axios. Query `language:por` or `language:eng`, `lang=pt|en`, `sort=readinglog`, a bounded result limit, and only the fields needed. Select the returned matching edition's title and cover. Use the work ID as the application book ID. Text search adds user terms to the same language-constrained query. A selected work's detail uses a work-key-constrained search, with a second unconstrained lookup only when the selected language returns no work.
2. Place a TanStack Query provider at the app root. Query keys include locale and search text/work ID. Set a useful stale time and disable eager retries. Pass AbortSignal to Axios. Do not retain previous-language query data while switching, so stale English metadata is never shown as Portuguese.
3. Parse remote responses defensively and omit records without a work ID, matching edition title, or author. Use edition-specific page count when present, otherwise work median; missing page counts remain optional in the UI. Descriptions and genres use restrained localized UI fallbacks rather than invented book descriptions or false translations.
4. Keep demonstration prices stable by deriving them from the work ID. Label them as fictional. Persist selected book snapshots in local storage with the cart and wishlist IDs, and refresh those snapshots when a matching edition is fetched. Saved books remain visible if the remote catalog changes or the selected language has no edition; show a language-availability notice instead of pretending that the old title was translated. Completed orders retain their existing snapshots.
5. Reuse the existing EmptyState visual style for no results, unavailable language, and request errors, adding a retry action where appropriate. Keep filter-only emptiness distinct from remote emptiness.

## Risks / Trade-offs

- Open Library explicitly limits anonymous traffic and discourages use as a high-traffic data backend → bounded results, debounce text search, TanStack Query caching, no bulk requests, and no per-card requests.
- The search result can change between visits or omit metadata → stable work IDs, saved snapshots, optional-field handling, and visible fallback states.
- Edition language metadata and translated titles may be incomplete → require a matching edition in the selected language; show an unavailable state where no matching edition exists.
- The existing `depois-eu-leio-v1` local storage format contains IDs but no snapshots → migrate safely by keeping completed orders and dropping legacy unresolved cart/wishlist entries rather than fabricating books.

## Migration Plan

Add data fetching and snapshot persistence, migrate the UI to async book data, then remove the static JSON import/file. Validate with controlled network fixtures and a production build. Rollback is a normal source revert; no remote schema or deployed database changes.

## Open Questions

None required to implement. The available edition metadata determines how often description and page fallbacks appear.
