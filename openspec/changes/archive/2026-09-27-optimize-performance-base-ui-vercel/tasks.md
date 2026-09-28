## 1. Dead Code and Package Cleanup

- [x] 1.1 Remove dead UI components `src/components/ui/radio-group.tsx` and `src/components/ui/select.tsx`
- [x] 1.2 Remove `@openrouter/sdk` permission from `pnpm-workspace.yaml` and move `shadcn` to `devDependencies`
- [x] 1.3 Refactor `src/lib/open-library.ts` to use native `fetch` with `AbortSignal` and remove `axios` from `package.json`
- [x] 1.4 Remove `next-themes` from `src/components/ui/sonner.tsx` and `package.json`

## 2. Base UI Migration

- [x] 2.1 Install `@base-ui-components/react` and remove `radix-ui` from `package.json`
- [x] 2.2 Update `components.json` to configure Base UI primitive style
- [x] 2.3 Refactor `src/components/ui/sheet.tsx` to use `@base-ui-components/react/dialog` preserving neobrutalist styling and GSAP animations
- [x] 2.4 Refactor `src/components/ui/button.tsx` to use Base UI or clean composable slot pattern

## 3. Font and Query Performance Optimization

- [x] 3.1 Install `@fontsource-variable/work-sans` and optimize font imports in `src/styles.css`
- [x] 3.2 Configure global `QueryClient` defaults in `src/routes/__root.tsx` (`refetchOnWindowFocus: false`)

## 4. Vercel and Nitro Deployment Configuration

- [x] 4.1 Install `nitro` and register `nitro()` plugin in `vite.config.ts`
- [x] 4.2 Create `vercel.json` with TanStack Start framework declaration

## 5. Verification and Linting

- [x] 5.1 Run `pnpm fix` to resolve Biome/Ultracite formatting and style diagnostics
- [x] 5.2 Run `pnpm build` to verify production client and server bundles build cleanly
- [x] 5.3 Run `pnpm test:e2e` to verify all 25 Playwright tests pass
