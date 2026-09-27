## Why

Tailwind CSS v4 and modern CSS defaults omit `cursor: pointer` on buttons, which can create ambiguity for users expecting clear interactive visual affordances across the storefront. Interactive elements such as buttons and role="button" controls should visually communicate clickability via a pointer cursor when active and indicate inactive status when disabled.

## What Changes

- Add global CSS rules in `src/styles.css` to enforce `cursor: pointer` for all `<button>` elements that are not disabled.
- Add global CSS rules in `src/styles.css` to enforce `cursor: pointer` for elements with `[role="button"]` that are not disabled or marked with `aria-disabled="true"`.
- Ensure disabled buttons (`:disabled`, `[aria-disabled="true"]`) display an appropriate non-interactive cursor (e.g., `not-allowed`).

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `storefront-experience`: Specify pointer cursor interactive affordances for buttons and non-disabled `role="button"` elements across the storefront.

## Impact

- Global stylesheet (`src/styles.css`).
- Consistent interactive hover feedback across all buttons, dropdown triggers, modal triggers, pagination, cart controls, and custom interactive role="button" elements.
