import { Link } from "@tanstack/react-router";
import { type PointerEvent, useRef } from "react";
import { toast } from "sonner";
import type { Book } from "@/lib/catalog";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { gsap, POINTER_QUERY, useGSAP, withMotion } from "@/lib/motion";
import {
  handleAddBookWithMilestones,
  handleToggleWishWithMilestones,
} from "@/lib/roast-trigger";
import { getCartBooks, getWishlistBooks, useStore } from "@/lib/store";
import { ActionButton } from "./action-button";
import { BookCover } from "./book-cover";

export function BookCard({
  book,
  revealIndex = 0,
}: {
  book: Book;
  revealIndex?: number;
}) {
  const card = useRef<HTMLElement>(null);
  const pointerMotion = useRef<{
    rotation: (value: number) => void;
    x: (value: number) => void;
    y: (value: number) => void;
  } | null>(null);
  const locale = useStore((state) => state.locale);
  const cartIds = useStore((state) => state.cartIds);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const addCart = useStore((state) => state.addCart);
  const toggleWish = useStore((state) => state.toggleWish);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const inCart = cartIds.includes(book.id);
  const wished = wishlistIds.includes(book.id);

  useGSAP(
    () =>
      withMotion(() => {
        if (!card.current?.isConnected) {
          return;
        }
        const element = card.current;
        const columns = element.parentElement
          ? getComputedStyle(element.parentElement)
              .gridTemplateColumns.trim()
              .split(" ").length
          : 1;
        gsap.fromTo(
          element,
          { autoAlpha: 0, rotation: -2, y: 22 },
          {
            autoAlpha: 1,
            clearProps: "opacity,visibility,transform",
            delay: (revealIndex % columns) * 0.07,
            duration: 0.5,
            ease: "back.out(1.2)",
            onComplete: () => {
              element.dataset.revealed = "true";
            },
            rotation: 0,
            scrollTrigger: {
              once: true,
              start: "top 92%",
              trigger: element,
            },
            y: 0,
          }
        );
      }),
    { scope: card }
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(POINTER_QUERY, () => {
        if (!card.current?.isConnected) {
          return;
        }
        pointerMotion.current = {
          rotation: gsap.quickTo(card.current, "rotation", { duration: 0.15 }),
          x: gsap.quickTo(card.current, "x", { duration: 0.15 }),
          y: gsap.quickTo(card.current, "y", { duration: 0.15 }),
        };
        return () => {
          pointerMotion.current = null;
          gsap.set(card.current, { clearProps: "transform" });
        };
      });
      return () => media.revert();
    },
    { scope: card }
  );

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (card.current?.dataset.revealed !== "true") {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const left = event.clientX - rect.left < rect.width / 2;
    const bottom = event.clientY - rect.top > rect.height / 2;
    pointerMotion.current?.rotation(left === bottom ? -1.2 : 1.2);
    pointerMotion.current?.x(-3);
    pointerMotion.current?.y(-3);
  }

  function onPointerLeave() {
    pointerMotion.current?.rotation(0);
    pointerMotion.current?.x(0);
    pointerMotion.current?.y(0);
  }

  return (
    <article
      className="flex h-full flex-col border-[3px] border-line bg-card shadow-[6px_6px_0_var(--line)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[8px_8px_0_oklch(63.7%_0.237_25.331)]"
      data-book-id={book.id}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      ref={card}
    >
      <Link
        aria-label={book.title[locale]}
        className="block w-full cursor-pointer transition-opacity hover:opacity-95"
        params={{ bookId: book.id }}
        to="/books/$bookId"
      >
        <BookCover book={book} locale={locale} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <div className="flex justify-between font-data text-ink/80 text-xs">
          <span>
            {book.pages === null
              ? text.pagesUnknown
              : `${formatNumber(book.pages, locale)} p.`}
          </span>
          {book.pages !== null && <span>~{readingHours(book.pages)}h</span>}
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <strong className="font-display text-ink text-xl">
            {formatPrice(book.price, locale)}
          </strong>
          {book.oldPrice !== undefined && (
            <del className="text-ink/60 text-sm">
              {formatPrice(book.oldPrice, locale)}
            </del>
          )}
        </div>

        <div className="flex gap-2">
          <ActionButton
            className="min-w-0 flex-1 px-3 py-2 text-xs sm:text-sm"
            disabled={!hydrated}
            onClick={async () => {
              if (inCart) {
                toast.info(text.duplicateToast);
                return;
              }
              const cartBooks = getCartBooks(
                useStore.getState().cartIds,
                useStore.getState().bookCache
              );
              const added = addCart(book);
              if (added) {
                toast.info(text.addedToast);
                await handleAddBookWithMilestones({
                  book,
                  cartBooks,
                  locale,
                  onAddedSuccess: () => true,
                  onDuplicate: () => undefined,
                });
              }
            }}
            tone={inCart ? "green" : "yellow"}
          >
            <span
              className={
                inCart ? "inline-block animate-del-pop" : "inline-block"
              }
              key={inCart ? "in" : "add"}
            >
              {inCart ? text.inCart : text.addCart}
            </span>
          </ActionButton>

          <ActionButton
            aria-label={wished ? text.removeWish : text.saveWish}
            aria-pressed={wished}
            className="w-11 flex-shrink-0 p-0 text-xl leading-none"
            disabled={!hydrated}
            onClick={async () => {
              const wishlistBooks = getWishlistBooks(
                useStore.getState().wishlistIds,
                useStore.getState().bookCache
              );
              if (toggleWish(book)) {
                toast.info(text.wishToast);
                await handleToggleWishWithMilestones({
                  book,
                  locale,
                  wishlistBooks,
                });
              }
            }}
            tone={wished ? "red" : "surface"}
          >
            <span
              className={
                wished ? "inline-block animate-del-heart" : "inline-block"
              }
              key={wished ? "yes" : "no"}
            >
              {wished ? "♥" : "♡"}
            </span>
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
