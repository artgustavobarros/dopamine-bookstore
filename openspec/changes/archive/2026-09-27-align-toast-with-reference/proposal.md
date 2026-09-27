## Why

The application currently has a fragmented and inconsistent toast notification system that departs from the comic bookstore identity established in the reference standalone (`Depois Eu Leio.html` and `"Sem título.png"`):
1. **Generic sonner toasts**: Regular user actions (adding books to cart, duplicate warnings, wishlist updates, reviews, Pix code copying, registration, and checkout errors) render using standard shadcn/sonner pills with Lucide icons, completely lacking the neo-brutalist comic book aesthetic.
2. **Inaccurate roast toast**: Even the custom roast toast (`src/lib/roast-toast.tsx`) deviates significantly from the standalone design: it uses a yellow box with square corners, a black badge tag, and lacks the signature comic speech-bubble tail/beak, the 18px rounded corners, the red Bangers SFX typography, and the tactile close button interactions.

Unifying all toast notifications under the comic speech-bubble model ensures 100% aesthetic consistency with the reference standalone, whether the message is a humorous roast, an informational notification, or a transaction alert.

## What Changes

- **Unified Comic Speech Bubble Toast Component**:
  - Replace disparate toast styles with a single, authentic comic speech bubble component inspired by the reference standalone.
  - Implement 18px rounded borders (`rounded-[18px]`), 3px solid dark borders (`border-[3px] border-line`), white/card background (`bg-card`), and crisp neo-brutalist offset shadow (`shadow-[6px_6px_0_var(--line)]`).
  - Add the signature comic speech bubble pointer/beak at the bottom-right using a rotated, skewed triangle with matching 3px borders.
  - Render comic SFX headers using Bangers typography (`font-accent text-2xl tracking-wider text-red`) with uppercase sound effects (e.g., `DE NOVO?!`, `BOA!`, `HMM.`, `ALERTA!`, `PAGO!`, `COPIADO!`, `SALVO!`).
  - Render punchy message text in Work Sans (`font-semibold text-base leading-snug text-ink`).
  - Include an interactive close button (`×`) that scales to 1.25 and highlights in red on hover.
  - Apply the entrance animation `animate-del-pop` (`animation: del-pop .4s cubic-bezier(.2,.9,.25,1.2)`) with `transform-origin: 85% 110%` anchored at the speech bubble beak.
- **Universal Comic Toast Trigger API**:
  - Standardize all toast emissions across the app (`book-card.tsx`, `books/$bookId.tsx`, `checkout/index.tsx`, `register.tsx`, `orders_.$orderId.tracking.tsx`, `roast-toast.tsx`, `roast-trigger.ts`) to use the comic speech bubble format with appropriate SFX tags and localized copy.
  - Provide helper functions or custom Sonner wrapper (`showComicToast({ sfx, message, duration? })`) supporting both quick notifications and rich roasts.

## Capabilities

### New Capabilities
- `comic-toast-notifications`: Unified speech-bubble toast notification system for all application alerts, feedback, and satirical roasts, matching the visual geometry, typography, and motion of the reference standalone.

### Modified Capabilities
- `storefront-experience`: Require that all user feedback notifications (cart updates, duplicates, wishlist modifications, copy actions) present through the comic speech-bubble toast model rather than generic UI alerts.

## Impact

- **Components**: `src/lib/roast-toast.tsx`, `src/components/ui/sonner.tsx`, `src/components/store/book-card.tsx`.
- **Routes**: `src/routes/books/$bookId.tsx`, `src/routes/checkout/index.tsx`, `src/routes/register.tsx`, `src/routes/orders_.$orderId.tracking.tsx`.
- **Styles**: `src/styles.css` (ensuring speech bubble pointer and `del-pop` transform origins are properly supported).
- **Specs**: Create `specs/comic-toast-notifications/spec.md` and `specs/storefront-experience/spec.md` delta.
