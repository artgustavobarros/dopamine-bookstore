## Context

The current `dopamine-bookstore` application was inspired by the standalone prototype (`Depois Eu Leio.html`), but evolved with minor divergences in colors (sRGB hex approximations instead of OKLCH), card structure (inset covers with redundant text blocks), button micro-interactions, missing address management (ViaCEP lookup), and a simplified checkout flow without the interactive credit card preview and 60-second Pix countdown simulation.

This design establishes a clean architectural plan to achieve 100% fidelity with the reference prototype while keeping our TanStack Router, TanStack Query, and OpenRouter AI roast capabilities fully intact.

## Goals / Non-Goals

**Goals:**
- Implement the exact OKLCH color token system for light and dark themes in `src/styles.css`.
- Inject the 10 native CSS `@keyframes del-*` animations and tactile neo-brutalist button physics (4px shadow expanding to 6px on hover, collapsing on press).
- Re-architect `BookCover` and `BookCard` to be flush 3/4 aspect ratio with halftone dot overlays, red hover shadows (8px), dynamic green Add button (`✓ No carrinho`), and red Heart button.
- Implement multiple saved addresses in `useStore` with ViaCEP auto-lookup (auto-fills Street, City, and State upon typing 8 digits).
- Rebuild `/checkout` with tactile address selector cards, interactive credit card preview (brand detection, masked numbers, expiry), and live Pix QR code countdown with prototype scan simulation.
- Re-style Auth buttons with dark backgrounds and vivid red offset shadows.

**Non-Goals:**
- Real payment processing (all checkout transactions remain strictly simulated).
- Replacing TanStack Router with single-file vanilla HTML (we maintain modern routing, code-splitting, and SSR).
- Discarding existing Open Library remote book search or OpenRouter LLM roast generator.

## Decisions

### Decision 1: OKLCH Token Architecture in `src/styles.css`
- **Choice**: Replace hex values in `:root` and `.dark` with the standalone's precise OKLCH variables:
  - Yellow: `oklch(90.5% 0.182 98.111)`
  - Red: `oklch(63.7% 0.237 25.331)`
  - Blue: `oklch(62.3% 0.214 259.815)`
  - Green: `oklch(79.2% 0.209 151.711)`
  - Pink: `oklch(82.3% 0.12 346.018)`
  - Paper (Light): `oklch(97% 0.001 106.424)` (~#F4EEDF, warmer than #f4f3ee)
  - Dark Card: `oklch(21.6% 0.006 56.043)`
  - Dark Line: `oklch(90.5% 0.182 98.111)` (neon yellow outlines in dark mode)
- **Rationale**: Modern browsers support OKLCH with wide color gamut and perceptual uniformity, producing vibrant neo-brutalist contrast that hex sRGB cannot match.
- **Alternatives considered**: Sticking with hex approximations (compromises visual fidelity with the reference).

### Decision 2: Native `@keyframes del-*` Suite and Tactile Button Physics
- **Choice**: Ingest the standalone's 10 CSS keyframes (`del-in`, `del-card`, `del-pop`, `del-stamp`, `del-drop`, `del-heart`, `del-bump`, `del-sheet`, `del-fade`, `del-spin`) into `src/styles.css`.
- **Button Physics**:
  - Base: `border: 3px solid var(--line); box-shadow: 4px 4px 0 var(--line); transition: transform .15s ease, box-shadow .15s ease`
  - Hover: `transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--line)` (or colored shadow like red for auth submit)
  - Active: `transform: translate(3px, 3px); box-shadow: 0px 0px 0 var(--line)`
- **Rationale**: Gives buttons the physical, punchy "press" feel of the standalone without relying on heavy JS runtime overhead for basic hover states.

### Decision 3: Flush Book Card & Cover Redesign
- **Choice**:
  - `BookCover`: Flush with the card's top and side edges (`aspect-ratio: 3/4`, `border-bottom: 3px solid var(--line)`), radial halftone pattern overlay, white title pill with hard shadow at top, author badge at bottom left, and rotated `PROMO!` badge at bottom right.
  - `BookCard`: Minimalist body containing Space Mono metadata (`824 p.  ~21h`), Archivo Black price, and bottom action bar.
  - Dynamic button states: Add button switches to green `oklch(79.2% 0.209 151.711)` with `"✓ No carrinho"` and `del-pop` animation. Heart button switches to red `oklch(63.7% 0.237 25.331)` with white heart and `del-heart` animation.
  - Hover on card container changes shadow to `8px 8px 0 oklch(63.7% 0.237 25.331)` (vivid red).

### Decision 4: Multi-Address Store & ViaCEP Integration
- **Choice**:
  - Extend user profile in `src/lib/store.ts`:
    ```ts
    export interface Address {
      id: string;
      label: string;
      cep: string;
      street: string;
      number: string;
      comp?: string;
      city: string;
      uf: string;
    }
    ```
  - Implement ViaCEP helper in `src/lib/viacep.ts`: fetch `https://viacep.com.br/ws/${cleanCep}/json/` and auto-populate street, city, and state when 8 digits are entered.
  - Provide address management on `/account` (add address with ViaCEP, delete, mark as preferred).

### Decision 5: Interactive Checkout with Card Preview & Pix Simulation
- **Choice**:
  - Address selection in checkout: list saved addresses as tactile selector cards + option to enter new address with "Salvar na minha conta" option.
  - Credit Card form: real-time visual credit card card displaying detected brand (`VISA`, `MASTERCARD`, `AMEX`, `ELO`), formatted digits with 4-number grouping, uppercase holder name, and expiry date. 10% simulated decline rate triggering satirical failure toasts.
  - Pix flow: full simulated payment waiting screen with generated 25x25 QR matrix, 60s countdown timer, progress bar, copy-code button, and `"Simular leitura no celular"` action that triggers green `"PAGO!"` stamp animation.

## Risks / Trade-offs

- **[Risk: ViaCEP API unreachable or offline]** → *Mitigation*: Wrap API call in try/catch; if request fails or CEP is not found, leave fields editable for manual completion without blocking.
- **[Risk: Prefers-reduced-motion compatibility]** → *Mitigation*: Ensure all `@keyframes del-*` animations and transforms are disabled or zero-duration under `@media (prefers-reduced-motion: reduce)`.
- **[Risk: Mobile viewport overflow on complex checkout cards]** → *Mitigation*: Use responsive grid (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) and flex-wrap with min-width: 0 so forms remain comfortable on 320px+ viewports.
