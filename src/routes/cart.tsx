import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { ActionButton } from "@/components/store/action-button";
import { BookCover } from "@/components/store/book-cover";
import { EmptyState } from "@/components/store/layout";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import { getCartBooks, getCartTotals, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const ids = useStore((state) => state.cartIds);
  const remove = useStore((state) => state.removeCart);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const selected = getCartBooks(ids);
  const totals = getCartTotals(ids);
  useInsertedPanelMotion(route, [hydrated, selected.length]);
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-8 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.cart}
      </h1>
      {hydrated ? (
        selected.length === 0 ? (
          <EmptyState action={text.backCatalog} title={text.cartEmpty} />
        ) : (
          <div
            className="grid gap-10 lg:grid-cols-[1fr_340px]"
            data-motion-panel
          >
            <div className="space-y-5">
              {selected.map((book) => (
                <article
                  className="flex gap-5 border-[3px] border-line bg-surface p-4 shadow-[4px_4px_0_var(--line)]"
                  key={book.id}
                >
                  <div className="hidden w-28 shrink-0 sm:block">
                    <BookCover book={book} locale={locale} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link
                      className="font-display text-xl hover:underline"
                      params={{ bookId: book.id }}
                      to="/books/$bookId"
                    >
                      {book.title[locale]}
                    </Link>
                    <p className="font-semibold text-sm">
                      {book.author[locale]}
                    </p>
                    <p className="font-data text-xs">
                      {formatNumber(book.pages, locale)} p. · ~
                      {readingHours(book.pages)}h
                    </p>
                    <strong className="mt-auto font-display text-xl">
                      {formatPrice(book.price, locale)}
                    </strong>
                  </div>
                  <button
                    aria-label={`${text.remove}: ${book.title[locale]}`}
                    className="self-start border-2 border-line p-2 hover:bg-red hover:text-white"
                    onClick={() => remove(book.id)}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <aside className="h-fit border-[3px] border-line bg-yellow p-6 text-[#141210] shadow-[6px_6px_0_var(--line)]">
              <h2 className="border-[#141210] border-b-[3px] pb-3 font-display text-2xl">
                {text.summary}
              </h2>
              <dl className="mt-5 space-y-3 font-semibold text-sm">
                <div className="flex justify-between gap-4">
                  <dt>{text.pages}</dt>
                  <dd>{formatNumber(totals.pages, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{text.hours}</dt>
                  <dd>~{readingHours(totals.pages)}h</dd>
                </div>
                {totals.savings > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt>{text.savings}</dt>
                    <dd>{formatPrice(totals.savings, locale)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-[#141210] border-t-[3px] pt-4 font-display text-xl">
                  <dt>{text.subtotal}</dt>
                  <dd>{formatPrice(totals.subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{text.totalReal}</dt>
                  <dd>{formatPrice(0, locale)}</dd>
                </div>
              </dl>
              <ActionButton asChild className="mt-7 w-full" tone="ink">
                <Link to="/checkout">{text.checkout}</Link>
              </ActionButton>
            </aside>
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
