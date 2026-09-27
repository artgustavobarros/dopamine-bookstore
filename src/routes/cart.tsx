import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  type Book,
  formatNumber,
  formatPrice,
  genreColors,
  type Locale,
  readingHours,
} from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import {
  dispatchBookRemoved,
  dispatchCartOpened,
} from "@/lib/roast-trigger";
import { getCartBooks, getCartTotals, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartItemRow({
  book,
  locale,
  text,
  onRemove,
}: {
  book: Book;
  locale: Locale;
  text: ReturnType<typeof t>;
  onRemove: (id: string) => void;
}) {
  const hours = readingHours(book.pages ?? 0);
  const hourUnit =
    locale === "pt"
      ? hours === 1
        ? "hora"
        : "horas"
      : hours === 1
        ? "hour"
        : "hours";

  return (
    <div className="flex items-center gap-4 border-[3px] border-line bg-card p-3 shadow-[4px_4px_0_var(--line)]">
      <div
        className={cn(
          "relative h-[88px] w-16 shrink-0 overflow-hidden border-2 border-line",
          genreColors[book.genre] || "bg-yellow"
        )}
      >
        {book.coverId ? (
          <img
            alt={book.title[locale]}
            className="h-full w-full object-cover"
            height={88}
            loading="lazy"
            src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
            width={64}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-1 text-center font-display text-[10px] text-ink leading-tight">
            {book.title[locale]}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          className="font-display text-ink text-lg leading-tight transition-colors hover:text-red"
          params={{ bookId: book.id }}
          to="/books/$bookId"
        >
          {book.title[locale]}
        </Link>
        <span className="text-sm">{book.author[locale]}</span>
        <span className="font-data text-muted-foreground text-xs">
          {book.pages === null
            ? text.pagesUnknown
            : `${formatNumber(book.pages, locale)} p. · ~${hours} ${hourUnit}`}
        </span>
        {book.sourceLocale !== locale && (
          <p className="text-muted-foreground text-xs">
            {text.savedLanguageNotice}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-lg">
          {formatPrice(book.price, locale)}
        </span>
        <button
          aria-label={`${text.remove}: ${book.title[locale]}`}
          className="btn-cart-remove"
          onClick={() => onRemove(book.id)}
          type="button"
        >
          {text.remove}
        </button>
      </div>
    </div>
  );
}

function CartPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const navigate = useNavigate();
  const locale = useStore((state) => state.locale);
  const ids = useStore((state) => state.cartIds);
  const bookCache = useStore((state) => state.bookCache);
  const remove = useStore((state) => state.removeCart);
  const addCart = useStore((state) => state.addCart);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const selected = getCartBooks(ids, bookCache);
  const totals = getCartTotals(ids, bookCache);
  useInsertedPanelMotion(route, [hydrated, selected.length]);

  const cartOpenedRef = useRef(false);
  useEffect(() => {
    if (hydrated && selected.length > 0 && !cartOpenedRef.current) {
      cartOpenedRef.current = true;
      dispatchCartOpened({
        cartBooks: selected,
        locale,
        onCheckout: () => navigate({ to: "/checkout" }),
        total: totals.subtotal,
      });
    }
  }, [hydrated, selected.length, locale, navigate, totals.subtotal]);

  const handleRemove = (id: string) => {
    const bookToRemove = selected.find((b) => b.id === id);
    if (!bookToRemove) return;
    const remaining = selected.filter((b) => b.id !== id);
    remove(id);
    dispatchBookRemoved({
      book: bookToRemove,
      locale,
      onUndo: () => addCart(bookToRemove),
      remainingCart: remaining,
    });
  };

  const shelfCount = Math.max(
    selected.length > 0 ? 1 : 0,
    Math.round(selected.length * 0.7)
  );
  const totalHours = readingHours(totals.pages);
  const totalHoursUnit =
    locale === "pt"
      ? totalHours === 1
        ? "hora"
        : "horas"
      : totalHours === 1
        ? "hour"
        : "hours";

  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-6 px-5 pt-12 sm:px-6"
      ref={route}
    >
      <h1 className="m-0 font-display text-4xl leading-none tracking-[-0.025em] sm:text-6xl">
        {text.cart}
      </h1>
      {hydrated ? (
        selected.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border-[3px] border-line border-dashed p-12 text-center">
            <p className="m-0 font-semibold text-2xl">{text.cartEmpty}</p>
            <Link className="btn-cart-back" to="/">
              {text.backCatalog}
            </Link>
          </div>
        ) : (
          <div
            className="grid items-start gap-7 lg:grid-cols-[1fr_340px]"
            data-motion-panel
          >
            <div className="flex flex-col gap-4">
              {selected.map((book) => (
                <CartItemRow
                  book={book}
                  key={book.id}
                  locale={locale}
                  onRemove={handleRemove}
                  text={text}
                />
              ))}
            </div>
            <aside className="relative flex flex-col gap-4 overflow-hidden border-[3px] border-line bg-yellow p-6 text-ink shadow-[8px_8px_0_var(--line)]">
              {/* Halftone radial pattern overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(14.7%_0.004_49.25/0.12)_1.2px,transparent_1.6px)] bg-[size:8px_8px]"
              />
              <h2 className="relative m-0 font-display text-2xl">
                {text.summary}
              </h2>
              <div className="relative flex flex-col gap-3 text-base">
                <div className="flex justify-between gap-3">
                  <span>{text.pages}</span>
                  <strong>{formatNumber(totals.pages, locale)}</strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span>{text.readTime}</span>
                  <strong>
                    ~{totalHours} {totalHoursUnit}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span>{text.shelf}</span>
                  <strong>{shelfCount}</strong>
                </div>
                {totals.savings > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>{text.savings}</span>
                    <strong>{formatPrice(totals.savings, locale)}</strong>
                  </div>
                )}
              </div>
              <div className="relative flex items-baseline justify-between border-ink border-t-[3px] pt-3">
                <span className="font-bold">{text.total}</span>
                <span className="font-display text-3xl">
                  {formatPrice(totals.subtotal, locale)}
                </span>
              </div>
              <Link className="btn-checkout-cta" to="/checkout">
                {text.checkout}
              </Link>
            </aside>
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
