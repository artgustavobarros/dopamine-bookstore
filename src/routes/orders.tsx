import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/store/layout";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { calculateDeliveryState, getStageColorClasses } from "@/lib/delivery";
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

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useInsertedPanelMotion(route, [hydrated, orders.length]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6" ref={route}>
      <h1 className="mb-8 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.orderHistory}
      </h1>

      {hydrated ? (
        orders.length === 0 ? (
          <EmptyState action={text.goHome} title={text.noOrders} />
        ) : (
          <div className="space-y-6" data-motion-panel>
            {[...orders].reverse().map((order) => {
              const deliveryState = calculateDeliveryState(order, locale, now);
              const stageColors = getStageColorClasses(
                deliveryState.stageIndex,
                deliveryState.confirmed
              );

              return (
                <article
                  className="grid border-[3px] border-line bg-card shadow-[6px_6px_0_var(--line)] md:grid-cols-[240px_1fr_1fr]"
                  key={order.id}
                >
                  <div className="flex flex-col gap-2 border-line border-b-[3px] bg-yellow p-5 text-ink md:border-r-[3px] md:border-b-0">
                    <span className="font-display text-2xl leading-tight">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <time
                      className="font-data text-ink/80 text-xs"
                      dateTime={order.createdAt}
                    >
                      {new Date(order.createdAt).toLocaleDateString(
                        locale === "pt" ? "pt-BR" : "en-US",
                        {
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                        }
                      )}
                    </time>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`self-start border-2 border-line px-2 py-0.5 font-bold font-data text-xs uppercase tracking-wider ${stageColors.badgeBg} ${stageColors.badgeFg}`}
                      >
                        {order.receiptConfirmed
                          ? `✓ ${text.trConfirmedBadge}`
                          : deliveryState.currentStage.label[locale]}
                      </span>
                    </div>

                    <div
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={deliveryState.pct}
                      className="mt-1 h-2.5 w-full overflow-hidden border-2 border-line bg-white"
                      role="progressbar"
                    >
                      <div
                        className="h-full bg-ink transition-[width] duration-1000 ease-linear"
                        style={{ width: deliveryState.pctCss }}
                      />
                    </div>

                    <Link
                      className="btn-tactile mt-3 self-start border-2 border-line bg-white px-3 py-1.5 font-bold text-ink text-xs shadow-[2px_2px_0_var(--line)] transition-all hover:bg-paper"
                      params={{ orderId: order.id }}
                      to="/orders/$orderId/tracking"
                    >
                      {text.trackBtn} →
                    </Link>
                  </div>

                  <div className="flex flex-col justify-between gap-3 border-line border-b-[3px] p-5 text-sm md:border-r-[3px] md:border-b-0">
                    <div className="space-y-1">
                      <strong className="block text-base text-ink">
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? locale === "pt"
                            ? "livro"
                            : "book"
                          : locale === "pt"
                            ? "livros"
                            : "books"}
                      </strong>
                      <span className="block text-ink/80 text-xs">
                        {formatNumber(order.totalPages, locale)}{" "}
                        {text.pages.toLowerCase()} · ~
                        {readingHours(order.totalPages)}h{" "}
                        {text.reading.toLowerCase()}
                      </span>
                      <span className="block font-data text-ink/70 text-xs uppercase">
                        {order.method === "card"
                          ? text.payCard
                          : order.method === "pix"
                            ? text.payPix
                            : text.none}
                      </span>
                    </div>

                    <div className="pt-2 font-display text-ink text-xl">
                      {formatPrice(order.totalPrice, locale)}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-5 text-sm leading-relaxed">
                    <ul className="space-y-1.5">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            className="font-semibold underline decoration-2 underline-offset-2 transition-colors hover:text-red"
                            params={{ bookId: item.id }}
                            to="/books/$bookId"
                          >
                            {item.title[locale]}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {order.address ? (
                      <div className="mt-3 truncate border-line border-t-2 pt-2 font-data text-ink/70 text-xs">
                        {order.address.label}: {order.address.city}/
                        {order.address.uf}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
