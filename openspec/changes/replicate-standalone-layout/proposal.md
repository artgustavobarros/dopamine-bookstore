## Why

The current storefront implementation has drifted from the reference standalone (`Depois Eu Leio.html`) across essential visual, tactile, and functional aspects:
- Colors are sRGB hex approximations instead of the rich, wide-gamut OKLCH tokens.
- Book cards have an inset/padded cover, redundant text below the cover, and lack the distinctive red hover shadow and dynamic green/red button states.
- Auth buttons lack the signature red offset shadow and micro-interaction expansion.
- Address management (multiple addresses, ViaCEP auto-lookup, and preferred selection) is completely missing from both checkout and account profiles.
- The checkout flow lacks the interactive credit card preview and the simulated Pix QR-code countdown experience.
- The native `@keyframes del-*` CSS animation system and tactile button physics are absent or only partially replaced with generic motion.

Realigning the codebase with the reference standalone will achieve 100% visual and functional fidelity while preserving our modern TanStack Router, TanStack Query, and OpenRouter AI roast capabilities.

## What Changes

- **Color Tokens & Theme Palette**: Replace static hex tokens in `src/styles.css` with exact OKLCH values (`oklch(90.5% 0.182 98.111)`, `oklch(63.7% 0.237 25.331)`, `oklch(97% 0.001 106.424)`, etc.) for light and dark modes, ensuring vibrant neo-brutalist contrast and warm paper background.
- **Native Animation System (`del-*`)**: Ingest the 10 core CSS `@keyframes` (`del-in`, `del-card`, `del-pop`, `del-stamp`, `del-drop`, `del-heart`, `del-bump`, `del-sheet`, `del-fade`, `del-spin`) and standard neo-brutalist hover/active micro-interactions (`transform: translate(-2px, -2px); box-shadow: 6px 6px 0`).
- **Book Card & Cover Redesign**:
  - Restructure `BookCover` to be flush with card borders (`aspect-ratio: 3/4`, `border-bottom: 3px solid var(--line)`) with integrated halftone radial dots, white title pill with hard shadow, author pill, and rotated `PROMO!` Bangers badge.
  - Simplify `BookCard` content below the cover to: Space Mono metadata (pages + hours), Archivo Black price, dynamic Add-to-Cart button (turns vibrant green `oklch(79.2% 0.209 151.711)` with `"✓ No carrinho"` and `del-pop` animation), and Heart button (turns solid red with white heart and `del-heart` animation).
  - Add red hover shadow `box-shadow: 8px 8px 0 oklch(63.7% 0.237 25.331)` to card articles.
- **Address Management & ViaCEP Autocomplete**:
  - Extend the user model in `src/lib/store.ts` to support multiple saved addresses (`addresses: Address[]`), default/preferred address (`prefAddr`), and address labels/nicknames.
  - Implement real-time ViaCEP integration (`https://viacep.com.br/ws/{cep}/json/`) that automatically populates Street, City, and State upon entering an 8-digit CEP.
  - Provide address management in `/account` (add, remove, mark as preferred) and address selector cards in `/checkout`.
- **Interactive Checkout & Pix Simulation**:
  - Rebuild checkout with tactile selector cards for delivery address and payment methods.
  - Add interactive credit card preview (live masked card visual with real-time brand detection: Visa, Mastercard, Amex, Elo, uppercase name, formatted numbers, and expiry).
  - Implement the simulated Pix flow: dedicated QR code countdown screen with a 60-second timer, color-shifting progress bar (yellow to red), copy code button, and a `"Simular leitura no celular"` prototype action that triggers the `"PAGO!"` stamp and order finalization.
- **Auth & Profile Buttons**:
  - Style auth submit buttons with dark background and vibrant red offset shadow (`box-shadow: 4px 4px 0 oklch(63.7% 0.237 25.331)` expanding to `6px 6px 0` on hover).
  - Align account profile actions, saved card list, and addresses with reference aesthetics.

## Capabilities

### New Capabilities
- None (existing capabilities will be updated).

### Modified Capabilities
- `storefront-experience`: Update requirements for OKLCH color tokens, flush 3/4 book cover with halftone overlay, simplified card body, dynamic green/red button states, and red card hover shadow.
- `simulated-checkout`: Update requirements to include multiple simulated delivery addresses with ViaCEP lookup, interactive credit card preview with brand detection, and live Pix QR code countdown simulation.
- `demo-identity-and-reviews`: Update requirements to support saved delivery addresses, saved payment cards, and neo-brutalist auth buttons with red offset shadows.
- `reference-motion`: Update requirements to specify the native `@keyframes del-*` suite, tactile button shadow expansion (4px -> 6px on hover, collapsing on active), and micro-animations for cart counter and wishlist heart.

## Impact

- **CSS & Design Tokens**: `src/styles.css` updated with OKLCH variables, `@keyframes del-*`, and global button interaction classes.
- **Components**: `src/components/store/book-card.tsx`, `src/components/store/book-cover.tsx`, `src/components/store/action-button.tsx`, `src/components/store/layout.tsx`.
- **Routes**: `src/routes/account.tsx`, `src/routes/checkout/index.tsx`, `src/routes/register.tsx`, `src/routes/cart.tsx`, `src/routes/index.tsx`.
- **Store & State**: `src/lib/store.ts` extended with `Address`, `CardInfo`, and methods for addresses, cards, and payment preference.
