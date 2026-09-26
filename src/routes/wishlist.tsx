import { createFileRoute } from "@tanstack/react-router";
import { ActionButton } from "@/components/store/action-button";
import { BookCard } from "@/components/store/book-card";
import { EmptyState } from "@/components/store/layout";
import type { Book } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useRouteEntrance } from "@/lib/motion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const ids = useStore((state) => state.wishlistIds);
  const bookCache = useStore((state) => state.bookCache);
  const hydrated = useStore((state) => state.hydrated);
  const moveAll = useStore((state) => state.moveWishesToCart);
  const text = t(locale);
  const selected = ids
    .map((id) => bookCache[id])
    .filter((book): book is Book => Boolean(book));
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-line border-b-[3px] pb-3">
        <h1 className="font-display text-4xl sm:text-5xl">{text.wishTitle}</h1>
        {selected.length > 0 && (
          <ActionButton onClick={moveAll}>{text.moveAll}</ActionButton>
        )}
      </div>
      {hydrated ? (
        selected.length === 0 ? (
          <EmptyState action={text.backCatalog} title={text.wishEmpty} />
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selected.map((book, index) => (
              <BookCard book={book} key={book.id} revealIndex={index} />
            ))}
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
