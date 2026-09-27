## Context

The application has two conflicting toast approaches:
1. `src/lib/roast-toast.tsx`: An experimental roast toast styled as a yellow box with square corners, a black badge, and no speech-bubble tail.
2. Standard Sonner toasts (`toast.info`, `toast.success`, `toast.error`): Used across `book-card.tsx`, `books/$bookId.tsx`, `checkout/index.tsx`, and `register.tsx`. These render generic shadcn-style pills with Lucide icons.

In contrast, the reference standalone (`Depois Eu Leio.html`) and design reference (`"Sem título.png"`) define a single, unified toast model for all notifications and roasts:
- White/card background (`var(--card)`) with 18px rounded corners (`rounded-[18px]`).
- 3px solid dark line border (`border-[3px] border-line`) with 6px offset shadow (`shadow-[6px_6px_0_var(--line)]`).
- Bottom-right speech bubble beak/tail (`bottom: -12px; right: 36px; width: 20px; height: 20px; transform: rotate(45deg) skew(12deg, 12deg)`).
- Red Bangers uppercase SFX header (`font-accent text-2xl tracking-wider text-red`).
- Semi-bold 16px body copy in Work Sans (`font-body font-semibold text-base leading-snug`).
- Close button (`×`) with hover scale (`scale(1.25)`) and red hover state.
- Entrance animation via `@keyframes del-pop` with `transform-origin: 85% 110%`.

## Goals / Non-Goals

**Goals:**
- Provide a single, reusable `ComicToast` component implementing the exact visual geometry, typography, and motion from the reference standalone.
- Provide a clean, universal API (`showComicToast({ sfx, message, duration? })`) used for both humorous roasts and routine storefront feedback (cart actions, wishlist modifications, copy events, validation errors, and delivery stages).
- Replace all unstyled and yellow toast invocations throughout the application with the new comic speech bubble.
- Support both light and dark modes seamlessly using CSS variables (`--card`, `--ink`, `--line`, `--color-red`).
- Ensure no clipping of the speech bubble beak within Sonner's container (`overflow: visible`).

**Non-Goals:**
- Replacing Sonner with a custom React portal from scratch (Sonner manages z-index, accessibility, stacking, timers, and unmounting effectively).
- Changing backend OpenRouter roast generation logic (payload `{ tag, roast }` maps directly to `{ sfx, message }`).

## Decisions

### Decision 1: Render through Sonner's `toast.custom` with a dedicated `ComicToast` component
- **Rationale**: Sonner handles lifecycle, timeouts, stacking order, and viewport placement. Rendering our custom comic speech bubble via `toast.custom((t) => <ComicToast id={t} sfx={sfx} message={message} />)` gives 100% control over the DOM and styling while keeping robust timeout and dismissal mechanics.
- **Alternatives considered**: Writing a custom React context and portal. Rejected because Sonner is already configured, supports swipe-to-dismiss, and handles screen reader accessibility.

### Decision 2: Universal `showComicToast` helper replacing generic Sonner calls
- **Rationale**: Currently, calls are scattered between `toast.info("...")`, `toast.success("...")`, and `showRoastToast(...)`. By introducing `showComicToast({ sfx, message, duration? })` (and maintaining `showRoastToast` as a convenient alias), all call sites gain evocative comic SFX headers (`DE NOVO?!`, `BOA!`, `DESEJADO!`, `COPIADO!`, `OPA!`, `VALEU!`) and consistent styling.
- **Alternatives considered**: Passing HTML strings to `toast(...)`. Rejected because React components provide proper styling, event binding, and type safety.

### Decision 3: Speech bubble beak geometry and shadow continuity
- **Rationale**: The beak is an absolute-positioned pseudo-element or inner `<div>` placed at `bottom: -12px; right: 36px` with `transform: rotate(45deg) skew(12deg, 12deg)`. The toast container and Sonner toast wrappers must use `overflow: visible` so the beak extends smoothly beyond the bottom border without truncation.

### Decision 4: Anchor `del-pop` animation to `85% 110%`
- **Rationale**: The reference standalone sets `transform-origin: 85% 110%` with `@keyframes del-pop`. This causes the speech bubble to "pop" out directly from its beak, providing an authentic comic book dialogue feel.

## Risks / Trade-offs

- **[Risk] Sonner container clipping the -12px beak** → **Mitigation**: Add CSS rules for `[data-sonner-toast]` and the toast container ensuring `overflow: visible` and removing default padding/backgrounds when custom comic toasts are rendered.
- **[Risk] Viewport overflow on narrow mobile screens (320px)** → **Mitigation**: Constrain width with `max-w-[min(380px,calc(100vw-32px))]`, wrap text with `break-words text-pretty`, and position at `right: 16px; bottom: 16px` on mobile.
- **[Risk] Missing SFX tag in legacy call sites** → **Mitigation**: Provide default fallback SFX tags based on message intent (e.g., success defaults to `"BOA!"`, info to `"OPA!"`, error to `"ALERTA!"`).
