## 1. Core Comic Toast Component & Trigger API

- [x] 1.1 Implement `ComicToast` component with 18px rounded corners, 3px solid border, 6px offset shadow, bottom-right speech bubble beak, Bangers SFX typography, Work Sans body, interactive close button, and `del-pop` entrance motion.
- [x] 1.2 Implement universal `showComicToast({ sfx, message, duration? })` helper in `src/lib/roast-toast.tsx` and maintain `showRoastToast({ tag, roast })` as an adapter.
- [x] 1.3 Update Sonner wrapper configuration in `src/components/ui/sonner.tsx` and `src/styles.css` to allow `overflow: visible` and unstyled positioning so the speech bubble beak and offset shadow render without clipping.

## 2. Storefront Actions Migration

- [x] 2.1 Migrate catalog card actions in `src/components/store/book-card.tsx` (duplicate notice, added to cart, wishlist toggle) to use `showComicToast`.
- [x] 2.2 Migrate book details page in `src/routes/books/$bookId.tsx` (duplicate notice, added to cart, wishlist toggle, review posted) to use `showComicToast`.

## 3. Checkout, Account & Delivery Tracking Migration

- [x] 3.1 Migrate checkout actions in `src/routes/checkout/index.tsx` (order completed, Pix code copied, validation errors) to use `showComicToast`.
- [x] 3.2 Migrate registration action in `src/routes/register.tsx` to use `showComicToast`.
- [x] 3.3 Verify and align delivery tracking stage updates in `src/routes/orders_.$orderId.tracking.tsx` to use `showComicToast`.

## 4. Visual Verification & Testing

- [x] 4.1 Verify comic speech-bubble visual presentation, responsive positioning, and dark mode styling against `"Sem título.png"`.
- [x] 4.2 Run test suite to verify no regressions in toast triggers across storefront and checkout flows.
