# Proposal: Optimize Performance, Migrate to Base UI, and Prepare Vercel Deployment

## Why

The Dopamine Bookstore application currently carries legacy dependencies (`axios`, `next-themes`, `radix-ui`, `@openrouter/sdk`), dead UI components (`radio-group.tsx`, `select.tsx`), an unoptimized font payload (26 font files loaded via Fontsource), and lacks the Nitro deployment configuration needed to run TanStack Start serverless functions seamlessly on Vercel. Migrating primitive components from Radix UI to Base UI (`@base-ui-components/react`), pruning dead code and bloated packages, streamlining font loading, and configuring the Nitro adapter prepares the project for production deployment on Vercel with optimal execution speed and zero unnecessary overhead.

## What Changes

- **Base UI Migration**: Replace `radix-ui` with `@base-ui-components/react`. Refactor `src/components/ui/sheet.tsx` (mobile navigation drawer) and `src/components/ui/button.tsx` to use Base UI primitives. Update `components.json`.
- **Dead Code & Package Pruning**:
  - Delete unused UI components: `src/components/ui/radio-group.tsx` and `src/components/ui/select.tsx`.
  - Replace `axios` with native `fetch` in `src/lib/open-library.ts` and remove `axios` from `package.json`.
  - Remove `next-themes` and clean up `src/components/ui/sonner.tsx`.
  - Move `shadcn` to `devDependencies` and remove `@openrouter/sdk` from `pnpm-workspace.yaml`.
- **Font & Asset Optimization**:
  - Migrate `Work Sans` to `@fontsource-variable/work-sans` to replace multiple static weights with a single variable font file.
  - Optimize font imports in `src/styles.css` to only load modern `woff2` files.
- **TanStack Query Tuning**:
  - Configure global `QueryClient` defaults in `src/routes/__root.tsx` (`refetchOnWindowFocus: false`, `gcTime`).
- **Vercel & Nitro Deployment**:
  - Add `nitro` and register the `nitro()` plugin in `vite.config.ts`.
  - Add `vercel.json` configuring `"framework": "tanstack-start"`.
  - Ensure server functions (`generateRoastFn` and `generateDiagnosisFn`) execute properly in serverless environments.

## Capabilities

### New Capabilities
- `vercel-deployment`: Configuration and build targets for deploying TanStack Start with server functions on Vercel via Nitro.

### Modified Capabilities
- `storefront-experience`: Drawer navigation (`Sheet`) and UI button primitives backed by Base UI instead of Radix UI.
- `remote-book-catalog`: Open Library client fetches data using native browser and Node `fetch` with AbortSignal, without `axios`.

## Impact

- Affected dependencies: `radix-ui` removed, `@base-ui-components/react` added, `axios` removed, `next-themes` removed, `nitro` added, `@fontsource-variable/work-sans` added.
- Affected files: `components.json`, `package.json`, `pnpm-workspace.yaml`, `vite.config.ts`, `vercel.json`, `src/styles.css`, `src/routes/__root.tsx`, `src/lib/open-library.ts`, `src/components/ui/*`.
- All 25 Playwright E2E tests must continue passing.
