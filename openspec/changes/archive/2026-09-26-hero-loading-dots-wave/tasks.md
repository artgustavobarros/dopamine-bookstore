## 1. Styles and Localization

- [x] 1.1 Add `@keyframes hero-dots-wave` and `.hero-dots-wave` utility classes in `src/styles.css` with diagonal linear gradient mask animation and reduced-motion fallback
- [x] 1.2 Add localized hero loading strings (`heroLoading`: "Buscando relíquias na estante..." / "Fetching books from Open Library...") in `src/lib/i18n.ts`

## 2. Hero Component Loading State Implementation

- [x] 2.1 Update `src/routes/index.tsx` to compute hero catalog loading state (`isLoading = (query.isLoading || !hydrated) && featured.length === 0`)
- [x] 2.2 Apply wave animation styling to the hero visual container's dots pattern during the loading phase
- [x] 2.3 Render three tilted neo-brutalist skeleton book cards (`top-[22%] left-[15%] -rotate-[8deg]`, `top-[17%] left-[40%] rotate-[2deg]`, `top-[21%] left-[63%] rotate-[9deg]`) while loading
- [x] 2.4 Update the bottom badge copy to display the localized loading indicator instead of zeroed page counts while loading
- [x] 2.5 Ensure seamless hand-off to the existing GSAP featured books entrance animation once data resolves

## 3. Verification and Testing

- [x] 3.1 Update or add automated tests in `tests/storefront.spec.ts` covering the hero loading elements and resolution
- [x] 3.2 Verify build and test suite execution
