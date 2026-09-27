import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type PointerEvent, useRef } from "react";
import { toast } from "sonner";
import type { Book } from "@/lib/catalog";
import {
  formatNumber,
  formatPrice,
  genreLabels,
  readingHours,
} from "@/lib/catalog";
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
  const addLabel = useRef<HTMLSpanElement>(null);
  const wishIcon = useRef<HTMLSpanElement>(null);
  const lastCart = useRef<boolean | null>(null);
  const lastWish = useRef<boolean | null>(null);
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

  useGSAP(
    () => {
      if (!hydrated) {
        return;
      }
      const previousCart = lastCart.current;
      const previousWish = lastWish.current;
      lastCart.current = inCart;
      lastWish.current = wished;
      return withMotion(() => {
        if (
          previousCart !== null &&
          previousCart !== inCart &&
          addLabel.current
        ) {
          gsap.fromTo(
            addLabel.current,
            { rotation: -4, scale: 0.6 },
            {
              clearProps: "transform",
              duration: 0.3,
              ease: "back.out(1.8)",
              rotation: 0,
              scale: 1,
            }
          );
        }
        if (
          previousWish !== null &&
          previousWish !== wished &&
          wishIcon.current
        ) {
          gsap.fromTo(
            wishIcon.current,
            { scale: 0.4 },
            {
              clearProps: "transform",
              duration: 0.35,
              ease: "back.out(2)",
              scale: 1,
            }
          );
        }
      });
    },
    {
      dependencies: [hydrated, inCart, wished],
      revertOnUpdate: true,
      scope: card,
    }
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
      className="flex h-full flex-col border-[3px] border-line bg-surface shadow-[6px_6px_0_var(--line)] transition-shadow hover:shadow-[8px_8px_0_#e44f4b]"
      data-book-id={book.id}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      ref={card}
    >
      <Link
        aria-label={book.title[locale]}
        className="block p-4 pb-2"
        params={{ bookId: book.id }}
        to="/books/$bookId"
      >
        <BookCover book={book} locale={locale} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-2 font-bold text-xs uppercase tracking-wide">
          <span>{genreLabels[book.genre][locale]}</span>
          {book.oldPrice !== undefined && (
            <span className="bg-red px-2 py-0.5 text-[#141210]">
              {text.sale}
            </span>
          )}
        </div>
        <Link
          className="font-display text-xl leading-tight hover:underline"
          params={{ bookId: book.id }}
          to="/books/$bookId"
        >
          {book.title[locale]}
        </Link>
        <p className="font-medium text-sm">{book.author[locale]}</p>
        <div className="mt-auto flex justify-between gap-2 border-line border-t-2 pt-3 font-data text-xs">
          <span>
            {book.pages === null
              ? text.pagesUnknown
              : `${formatNumber(book.pages, locale)} p.`}
          </span>
          {book.pages !== null && <span>~{readingHours(book.pages)}h</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <strong className="font-display text-xl">
            {formatPrice(book.price, locale)}
          </strong>
          {book.oldPrice !== undefined && (
            <del className="text-sm opacity-70">
              {formatPrice(book.oldPrice, locale)}
            </del>
          )}
        </div>
        <span className="font-data text-[10px] uppercase">
          {text.demoPrice}
        </span>
        {book.sourceLocale !== locale && (
          <p className="text-xs">{text.savedLanguageNotice}</p>
        )}
        <div className="flex gap-2">
          <ActionButton
            className="min-w-0 flex-1 px-2 text-xs sm:text-sm"
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
          >
            <span className="inline-block" ref={addLabel}>
              {inCart ? text.inCart : text.addCart}
            </span>
          </ActionButton>
          <ActionButton
            aria-label={wished ? text.removeWish : text.saveWish}
            aria-pressed={wished}
            className="w-11 p-0"
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
            tone={wished ? "yellow" : "surface"}
          >
            <span className="inline-flex" ref={wishIcon}>
              <Heart className={wished ? "fill-[#141210]" : ""} />
            </span>
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
