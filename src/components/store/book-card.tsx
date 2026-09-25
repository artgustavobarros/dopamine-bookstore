import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Book } from "@/lib/catalog";
import {
  formatNumber,
  formatPrice,
  genreLabels,
  readingHours,
} from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { ActionButton } from "./action-button";
import { BookCover } from "./book-cover";

export function BookCard({ book }: { book: Book }) {
  const locale = useStore((state) => state.locale);
  const cartIds = useStore((state) => state.cartIds);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const addCart = useStore((state) => state.addCart);
  const toggleWish = useStore((state) => state.toggleWish);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const inCart = cartIds.includes(book.id);
  const wished = wishlistIds.includes(book.id);
  return (
    <article className="flex h-full flex-col border-[3px] border-line bg-surface shadow-[6px_6px_0_var(--line)]">
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
          <span>{formatNumber(book.pages, locale)} p.</span>
          <span>~{readingHours(book.pages)}h</span>
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
        <div className="flex gap-2">
          <ActionButton
            className="min-w-0 flex-1 px-2 text-xs sm:text-sm"
            disabled={!hydrated}
            onClick={() =>
              toast.info(
                addCart(book.id) ? text.addedToast : text.duplicateToast
              )
            }
          >
            {inCart ? text.inCart : text.addCart}
          </ActionButton>
          <ActionButton
            aria-label={wished ? text.removeWish : text.saveWish}
            aria-pressed={wished}
            className="w-11 p-0"
            disabled={!hydrated}
            onClick={() => {
              if (toggleWish(book.id)) {
                toast.info(text.wishToast);
              }
            }}
            tone={wished ? "yellow" : "surface"}
          >
            <Heart className={wished ? "fill-[#141210]" : ""} />
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
