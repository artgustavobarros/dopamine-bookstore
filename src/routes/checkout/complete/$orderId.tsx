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
              rotation: -3,
              scale: 1,
            }
          );
        }
      }),
    { dependencies: [hydrated, orderId], revertOnUpdate: true, scope: route }
  );
  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-6" ref={route}>
      {hydrated ? (
        order ? (
          <div className="border-[3px] border-line bg-green p-7 text-[#141210] shadow-[8px_8px_0_var(--line)] sm:p-12">
            <span
              className="inline-block -rotate-3 border-[#141210] border-[3px] bg-white px-3 py-1 font-bold font-data text-xs"
              ref={stamp}
            >
              {text.orderCode} #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="mt-7 max-w-[15ch] font-display text-4xl leading-tight sm:text-6xl">
              {text.confirmed}
            </h1>
            <p className="mt-4 font-bold text-xl">{text.balance}</p>
            <div className="mt-9 grid gap-4 border-[#141210] border-y-[3px] py-6 sm:grid-cols-3">
              <div>
                <span className="block font-data text-xs">
                  {text.totalReal}
                </span>
                <strong className="font-display text-3xl">
                  {formatPrice(0, locale)}
                </strong>
              </div>
              <div>
                <span className="block font-data text-xs">{text.subtotal}</span>
                <strong className="font-display text-3xl">
                  {formatPrice(order.totalPrice, locale)}
                </strong>
              </div>
              <div>
                <span className="block font-data text-xs">{text.pages}</span>
                <strong className="font-display text-3xl">
                  {formatNumber(order.totalPages, locale)} · ~
                  {readingHours(order.totalPages)}h
                </strong>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <ActionButton asChild tone="surface">
                <Link to="/orders">{text.seeOrders}</Link>
              </ActionButton>
              <ActionButton asChild tone="ink">
                <Link to="/stats">{text.myStats}</Link>
              </ActionButton>
            </div>
          </div>
        ) : (
          <EmptyState action={text.goHome} title={text.noOrders} />
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
