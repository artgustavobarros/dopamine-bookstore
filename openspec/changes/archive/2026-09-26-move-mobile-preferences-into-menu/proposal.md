## Why

At widths where the hamburger menu replaces desktop navigation, language and theme controls still occupy the compact header. Moving them into the menu gives the header more room and groups navigation preferences in one predictable place.

## What Changes

- Below the `lg` breakpoint, remove the language and theme controls from the header and place them at the bottom of the hamburger sheet, after its navigation links.
- Keep both controls visible and usable in the desktop header when the hamburger is absent.
- Preserve the existing language and theme behavior, accessible names, and saved preferences.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `storefront-experience`: Specify where language and theme controls appear at hamburger and desktop widths, and that the sheet controls remain usable.

## Impact

- Affects the responsive header and mobile sheet in `src/components/store/layout.tsx`.
- Updates the storefront experience specification and the mobile preference coverage in `tests/storefront.spec.ts`.
- No API, data model, or dependency changes.
