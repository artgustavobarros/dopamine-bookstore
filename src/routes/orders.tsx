import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/store/layout";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const orders = useStore((state) => state.orders);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  useInsertedPanelMotion(route, [hydrated, orders.length]);
  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-8 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.orderHistory}
      </h1>
      {hydrated ? (
        orders.length === 0 ? (
          <EmptyState action={text.goHome} title={text.noOrders} />
        ) : (
          <div className="space-y-6" data-motion-panel>
            {[...orders].reverse().map((order) => (
              <article
                className="border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]"
                key={order.id}
              >
                <div className="flex flex-wrap justify-between gap-3 border-line border-b-[3px] pb-3">
                  <h2 className="font-display text-xl">
                    {text.orderCode} #{order.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <time
                    className="font-data text-xs"
                    dateTime={order.createdAt}
                  >
                    {new Date(order.createdAt).toLocaleString(
                      locale === "pt" ? "pt-BR" : "en-US",
                      { dateStyle: "medium", timeStyle: "short" }
                    )}
                  </time>
                </div>
                <ul className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <li
                      className="flex flex-wrap justify-between gap-2"
                      key={item.id}
                    >
                      <Link
                        className="font-semibold underline decoration-2 underline-offset-2"
                        params={{ bookId: item.id }}
                        to="/books/$bookId"
                      >
                        {item.title[locale]}
                      </Link>
                      <span>{formatPrice(item.price, locale)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap justify-between gap-3 border-line border-t-2 pt-4 font-data text-xs">
                  <span>
                    {formatNumber(order.totalPages, locale)}{" "}
                    {text.pages.toLowerCase()} · ~
                    {readingHours(order.totalPages)}h
                  </span>
                  <strong className="font-display text-lg">
                    {formatPrice(order.totalPrice, locale)}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
