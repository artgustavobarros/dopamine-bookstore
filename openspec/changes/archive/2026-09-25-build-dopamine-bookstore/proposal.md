## Why

The repository has no web app yet. Build a playful, fully usable **Depois Eu Leio** bookstore inspired by the supplied HTML so visitors can enjoy the impulse to browse and “buy” books without spending money.

## What Changes

- Create a responsive TanStack Start storefront that follows the reference's bold typography, thick outlines, bright book-category colors, paper background, and satirical Portuguese copy.
- Provide a JSON-backed book catalog with search, filters, book details, and sample reviews.
- Add a wishlist, cart, demo identity, user reviews, simulated checkout, confirmation, order history, and reading/impulse statistics.
- Save the visitor's demo state in browser local storage so it survives reloads; offer Portuguese and English copy plus light and dark themes.
- Keep the purchase experience explicitly fictional: no real payment processing, usable Pix code, card details, server account, or backend persistence.

## Capabilities

### New Capabilities

- `storefront-experience`: Responsive reference-inspired shell, navigation, language/theme preferences, and accessible interaction feedback.
- `catalog-discovery`: JSON book data, catalog search/filtering, book details, and sample reviews.
- `shopping-lists`: Cart and wishlist behavior, derived totals, and local persistence.
- `demo-identity-and-reviews`: Browser-local demo sign-in and visitor-written book reviews.
- `simulated-checkout`: Fictional checkout, order confirmation, and order history.
- `reading-insights`: Statistics derived from fictional orders and contextual humorous feedback.

### Modified Capabilities

None.

## Impact

- Adds the initial TypeScript/React application, TanStack Start routes, static catalog JSON, shared components, forms, client state, styling, and verification scripts.
- Uses Tailwind utility classes in JSX by default, shadcn/ui where suitable, Ultracite, React Hook Form, Zod with `@hookform/resolvers`, and Zustand. Use T3 Env only if environment variables are introduced.
- The supplied reference is `C:\Users\arthu\Downloads\Depois Eu Leio (1).html` (`/mnt/c/Users/arthu/Downloads/Depois Eu Leio (1).html` in this workspace).
