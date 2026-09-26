## Context

`StoreLayout` renders the language and theme buttons beside the cart at every viewport width. The desktop navigation disappears below Tailwind's `lg` breakpoint, where a Radix sheet supplies mobile navigation. That sheet already fills the viewport height and contains a header and link list. Preference state and persistence live in the existing store.

## Goals / Non-Goals

**Goals:**

- Show one language control and one theme control in the header at `lg` and wider, and in the sheet below `lg`.
- Keep the sheet controls at its bottom, below the navigation links, including on short viewports.
- Keep preference toggles accessible, immediately effective, and persistent without closing the sheet.

**Non-Goals:**

- Change preference storage, default values, available languages, or themes.
- Redesign the navigation destinations or the desktop header.

## Decisions

1. Use the same `lg` responsive breakpoint for preference placement as the existing navigation and hamburger visibility. Render controls in both locations with complementary responsive display classes. This follows the current CSS responsive pattern and avoids JavaScript viewport state or moving a focused element across the DOM.
2. Put the sheet controls in a footer after the navigation list. Let the navigation region take available height and scroll when space is tight; keep the footer at the bottom of the sheet with adequate padding and touch targets. A simple margin below the links would leave controls high in a tall sheet and could push them offscreen in a short one.
3. Reuse the existing locale and theme store actions and localized accessible names. Keep the sheet open when a preference changes so users can see the result and change it again. Navigation links retain their current close behavior.

## Risks / Trade-offs

- [Two responsive copies of each button can diverge in behavior] → Keep labels, state, and handlers sourced from the same `StoreLayout` values and verify both viewport modes.
- [A short viewport could hide bottom controls behind the navigation list] → Allow the link region to scroll independently while the footer remains visible; verify with a short mobile viewport.

## Migration Plan

No data migration is needed. The layout change ships with the existing store state. Rollback restores the previous header placement.

## Open Questions

None.
