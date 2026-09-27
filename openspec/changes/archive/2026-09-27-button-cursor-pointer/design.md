## Context

In Tailwind CSS v4 and modern CSS resets, the default `cursor: pointer` behavior for `<button>` elements is omitted by default. In Dopamine Bookstore, interface components use native `<button>` tags, Radix UI primitive wrappers (`src/components/ui/button.tsx`), and custom elements with `role="button"`. To restore intuitive visual feedback and meet user expectations, active button and button-role elements must consistently show `cursor: pointer` without requiring manual addition of utility classes across every component.

## Goals / Non-Goals

**Goals:**
- Provide a consistent `cursor: pointer` visual affordance for all enabled native `<button>` elements.
- Provide `cursor: pointer` for all non-disabled elements possessing `role="button"`.
- Provide a distinct non-interactive affordance (`cursor: not-allowed`) for disabled buttons and disabled button-role elements.
- Keep the solution centralized and maintainable in `src/styles.css`.

**Non-Goals:**
- Manually appending `cursor-pointer` utility classes to every individual JSX file or component.
- Altering existing click handling or keyboard accessibility behaviors.

## Decisions

### 1. Global CSS rules in `src/styles.css` vs. component-level utilities
- **Decision**: Define base rules in `src/styles.css`.
- **Rationale**: A centralized stylesheet rule guarantees that all current and future buttons and `[role="button"]` elements adhere to the interactive cursor policy automatically.
- **Alternatives considered**: Adding `cursor-pointer` to `buttonVariants` in `src/components/ui/button.tsx`. This was rejected as insufficient because standard `<button>` tags and custom `role="button"` elements across the app would remain unaffected.

### 2. Specific selectors for active and disabled states
- **Selectors**:
  ```css
  button:not(:disabled),
  [role="button"]:not(:disabled):not([aria-disabled="true"]) {
    cursor: pointer;
  }

  button:disabled,
  [role="button"]:disabled,
  [role="button"][aria-disabled="true"] {
    cursor: not-allowed;
  }
  ```
- **Rationale**: Handles both native form control state (`:disabled`) and ARIA-based state (`aria-disabled="true"`), ensuring accessibility standards are respected.

## Risks / Trade-offs

- **[Risk]** Specific elements might need custom cursors (e.g. `cursor-wait` or `cursor-default`).
  - **Mitigation**: Base element rules have low CSS specificity, allowing explicit Tailwind utility classes like `cursor-default` or `cursor-wait` to cleanly override the default when needed.
