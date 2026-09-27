import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ActionButton } from "@/components/store/action-button";
import { EmptyState } from "@/components/store/layout";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { gsap, useGSAP, useRouteEntrance, withMotion } from "@/lib/motion";
import { showRoastToast } from "@/lib/roast-toast";
import { generateRoastFn } from "@/lib/server/roast";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout/complete/$orderId")({
  component: CompletePage,
});

function CompletePage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const stamp = useRef<HTMLSpanElement>(null);
  const completeRoastFired = useRef(false);
  const { orderId } = Route.useParams();
  const locale = useStore((state) => state.locale);
  const orders = useStore((state) => state.orders);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const order = orders.find((entry) => entry.id === orderId);

  useEffect(() => {
    let active = true;
    async function triggerRoast() {
      if (hydrated && order && !completeRoastFired.current) {
        completeRoastFired.current = true;
        const roast = await generateRoastFn({
          data: {
            event: "order_completed",
            locale,
            paymentMethod: order.method,
            pretendSpend: order.totalPrice,
            totalPages: order.totalPages,
          },
        });
        if (active) {
          showRoastToast(roast);
        }
      }
    }
    triggerRoast();
    return () => {
      active = false;
    };
  }, [hydrated, order, locale]);

  useGSAP(
    () =>
      withMotion(() => {
        if (stamp.current?.isConnected && hydrated && order) {
          gsap.fromTo(
            stamp.current,
            {
              autoAlpha: 0,
              rotation: -12,
              scale: 1.8,
            },
            {
              autoAlpha: 1,
              clearProps: "opacity,visibility,transform",
              delay: 0.25,
              duration: 0.6,
              ease: "back.out(1.8)",
              rotation: -2,
              scale: 1,
            }
          );
        }
      }),
    { dependencies: [hydrated, orderId], revertOnUpdate: true, scope: route }
  );

  return (
    <div
      className="mx-auto max-w-5xl space-y-7 px-5 pt-10 pb-16 sm:px-6"
      ref={route}
    >
      {hydrated ? (
        order ? (
          <>
            <div className="relative overflow-hidden border-[3px] border-line bg-blue p-8 text-ink shadow-[8px_8px_0_var(--line)] sm:p-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(14.7%_0.004_49.25_/_0.3)_1.6px,transparent_2px)] [background-size:12px_12px]" />

              <div className="relative flex flex-col items-start gap-4">
                <span
                  className="inline-block -rotate-2 border-[3px] border-line bg-yellow px-4 py-1 font-accent text-2xl text-ink tracking-wide shadow-[2px_2px_0_var(--line)] sm:text-3xl"
                  ref={stamp}
                >
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <h1 className="border-[3px] border-line bg-card px-5 py-4 font-display text-4xl text-ink leading-none shadow-[6px_6px_0_var(--line)] sm:text-6xl">
                  {text.confirmed}
                </h1>
                <p className="bg-ink px-4 py-2 font-bold text-paper text-xl sm:text-2xl">
                  {text.balance}
                </p>
              </div>
            </div>

            <div className="grid divide-y-[3px] divide-line border-[3px] border-line bg-card shadow-[6px_6px_0_var(--line)] sm:grid-cols-2 sm:divide-x-[3px] sm:divide-y-0 md:grid-cols-4">
              <div className="p-6">
                <div className="font-display text-2xl text-ink sm:text-3xl">
                  {formatPrice(order.totalPrice, locale)}
                </div>
                <div className="mt-1 text-ink/80 text-sm">
                  {locale === "pt" ? "não gastos" : "not spent"}
                </div>
              </div>

              <div className="p-6">
                <div className="font-display text-2xl text-ink sm:text-3xl">
                  {formatNumber(order.totalPages, locale)}
                </div>
                <div className="mt-1 text-ink/80 text-sm">
                  {text.pagesConscience}
                </div>
              </div>

              <div className="p-6">
                <div className="font-display text-2xl text-ink sm:text-3xl">
                  ~{readingHours(order.totalPages)}h
                </div>
                <div className="mt-1 text-ink/80 text-sm">
                  {text.estReading}
                </div>
              </div>

              <div className="p-6">
                <div className="font-display text-2xl text-ink sm:text-3xl">
                  {order.items.length}
                </div>
                <div className="mt-1 text-ink/80 text-sm">
                  {text.shelfLower}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <ActionButton asChild tone="ink">
                <Link
                  params={{ orderId: order.id }}
                  to="/orders/$orderId/tracking"
                >
                  {text.trackBtn} →
                </Link>
              </ActionButton>
              <ActionButton asChild tone="yellow">
                <Link to="/orders">{text.seeOrders}</Link>
              </ActionButton>
              <ActionButton asChild tone="surface">
                <Link to="/stats">{text.stats}</Link>
              </ActionButton>
              <ActionButton asChild tone="surface">
                <Link to="/">{text.goHome}</Link>
              </ActionButton>
            </div>
          </>
        ) : (
          <EmptyState action={text.goHome} title={text.noOrders} />
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
