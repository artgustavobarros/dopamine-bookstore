import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { formatAddressLine } from "@/components/store/address-manager";
import { EmptyState } from "@/components/store/layout";
import { calculateDeliveryState } from "@/lib/delivery";
import { t } from "@/lib/i18n";
import { useRouteEntrance } from "@/lib/motion";
import {
  dispatchDelivered,
  dispatchDeliveryReceiptConfirmed,
  dispatchDeliveryStage,
} from "@/lib/roast-trigger";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/orders_/$orderId/tracking")({
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const { orderId } = Route.useParams();
  const locale = useStore((state) => state.locale);
  const orders = useStore((state) => state.orders);
  const hydrated = useStore((state) => state.hydrated);
  const skipOrderStage = useStore((state) => state.skipOrderStage);
  const confirmOrderReceipt = useStore((state) => state.confirmOrderReceipt);
  const text = t(locale);

  const order = orders.find((entry) => entry.id === orderId);
  const [now, setNow] = useState(Date.now());
  const seenStageRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deliveryState = order
    ? calculateDeliveryState(order, locale, now)
    : null;

  useEffect(() => {
    if (!deliveryState) {
      return;
    }
    const currentIdx = deliveryState.stageIndex;
    if (
      seenStageRef.current !== undefined &&
      currentIdx > seenStageRef.current
    ) {
      const stage = deliveryState.currentStage;
      if (currentIdx === 6) {
        dispatchDelivered({
          locale,
          pages: order?.totalPages ?? 0,
        });
      } else if (currentIdx < 6) {
        dispatchDeliveryStage({
          eta: deliveryState.etaFormatted,
          locale,
          orderId: order?.id ?? orderId,
          stage: stage.label[locale],
        });
      }
    }
    seenStageRef.current = currentIdx;
  }, [deliveryState, locale, order, orderId]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-6" ref={route}>
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      </div>
    );
  }

  if (!(order && deliveryState)) {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-6" ref={route}>
        <EmptyState action={text.seeOrders} title={text.noOrders} />
      </div>
    );
  }

  const {
    arrived,
    confirmed: isConfirmed,
    currentStage,
    etaClock,
    etaFormatted,
    pct,
    pctCss,
    skipDeltaSeconds,
    stageIndex,
    steps,
  } = deliveryState;

  const heroBg = isConfirmed ? "bg-green text-ink" : "bg-yellow text-ink";

  function handleSkipStage() {
    if (!arrived && order) {
      skipOrderStage(order.id, skipDeltaSeconds);
      setNow(Date.now());
    }
  }

  function handleConfirmReceipt() {
    if (order && !order.receiptConfirmed) {
      confirmOrderReceipt(order.id);
      dispatchDeliveryReceiptConfirmed({
        locale,
        orderId: order.id,
        pages: order.totalPages,
      });
    }
  }

  return (
    <div
      className="mx-auto max-w-5xl space-y-7 px-5 pt-8 pb-16 sm:px-6"
      ref={route}
    >
      <div>
        <ActionButton asChild tone="surface">
          <Link to="/orders">← {text.orders}</Link>
        </ActionButton>
      </div>

      <section
        className={`relative flex flex-col gap-6 overflow-hidden border-[3px] border-line p-6 shadow-[8px_8px_0_var(--line)] transition-colors duration-500 sm:p-8 ${heroBg}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(14.7%_0.004_49.25_/_0.25)_1.6px,transparent_2px)] [background-size:12px_12px]" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-3">
            <span className="inline-block -rotate-2 border-[3px] border-line bg-white px-3 py-1 font-accent text-2xl text-ink tracking-wide">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="border-[3px] border-line bg-white px-4 py-3 font-display text-3xl text-ink leading-none shadow-[6px_6px_0_var(--line)] sm:text-5xl">
              {currentStage.label[locale]}
            </h1>
          </div>

          <div className="flex flex-col items-end border-[3px] border-line bg-ink px-4 py-3 text-paper shadow-[4px_4px_0_var(--line)]">
            <span className="font-data text-xs uppercase tracking-wider">
              {arrived ? text.trEtaDone : text.trEta}
            </span>
            <span className="font-display text-3xl sm:text-4xl">
              {etaFormatted}
            </span>
            {arrived ? null : (
              <span className="font-data text-paper/80 text-xs">
                {text.trAt} {etaClock}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-col">
          <div className="flex justify-between border-[3px] border-line border-b-0 bg-white px-3 py-1.5 font-bold font-data text-ink text-xs sm:text-sm">
            <span>
              {text.trStep} {stageIndex + 1} {text.trOf} 8
            </span>
            <span>{pct}%</span>
          </div>
          <div
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={pct}
            className="relative h-8 overflow-hidden border-[3px] border-line bg-white"
            role="progressbar"
          >
            <div
              className="h-full bg-ink transition-[width] duration-1000 ease-linear"
              style={{ width: pctCss }}
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 flex items-center px-1 text-paper text-xl leading-none transition-[left] duration-1000 ease-linear"
              style={{ left: pctCss, transform: "translateX(-100%)" }}
            >
              <span className="inline-block animate-del-truck">
                {isConfirmed ? "★" : "▶"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
          <h2 className="mb-6 font-display text-2xl text-ink">
            {text.trTimeline}
          </h2>

          <div className="flex flex-col">
            {steps.map((st) => (
              <div
                className="grid grid-cols-[40px_minmax(0,1fr)] gap-4"
                key={st.index}
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center font-bold text-lg transition-colors ${
                      st.isDone
                        ? "border-[3px] border-line border-solid bg-green text-ink"
                        : st.current
                          ? "animate-del-ping border-[3px] border-line border-solid bg-yellow text-ink"
                          : "border-[3px] border-line border-dashed bg-card text-ink/50"
                    }`}
                  >
                    {st.icon}
                  </span>
                  {st.notLast ? (
                    <span
                      className={`min-h-[28px] w-1.5 flex-1 border-line border-x-[3px] transition-colors ${
                        st.isDone ? "bg-green" : "bg-card"
                      }`}
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-col gap-1 pb-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <strong className="text-ink text-lg">{st.label}</strong>
                    <span
                      className={`px-2 py-0.5 font-bold font-data text-xs ${
                        st.current
                          ? "border border-line bg-yellow text-ink shadow-[2px_2px_0_var(--line)]"
                          : "text-ink/80"
                      }`}
                    >
                      {st.whenBadge}
                    </span>
                  </div>

                  <p className="text-pretty text-ink/80 text-sm">{st.desc}</p>

                  {st.current ? (
                    <div className="mt-2 flex animate-del-in flex-col gap-1.5 border-[3px] border-line bg-paper p-3">
                      <div className="flex justify-between font-bold font-data text-ink text-xs uppercase">
                        <span>{text.trNextIn}</span>
                        <span>{st.timeRemainingFormatted}</span>
                      </div>
                      <div className="relative h-3.5 overflow-hidden border-2 border-line bg-card">
                        <div
                          className="h-full bg-yellow transition-[width] duration-1000 ease-linear"
                          style={{ width: st.pctCss }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(14.7%_0.004_49.25_/_0.2)_1.2px,transparent_1.6px)] [background-size:8px_8px]" />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          {arrived ? (
            isConfirmed ? (
              <div className="flex animate-del-pop flex-col items-start gap-2 border-[3px] border-line bg-green p-5 text-ink shadow-[6px_6px_0_var(--line)]">
                <span className="inline-block -rotate-3 border-[3px] border-line bg-white px-3 py-1 font-accent text-2xl text-ink leading-none tracking-wide shadow-[2px_2px_0_var(--line)] sm:text-3xl">
                  {text.trConfirmedStamp}
                </span>
                <p className="text-pretty font-bold text-sm sm:text-base">
                  {text.trConfirmedText}
                </p>
                {order.confirmedReceiptAt ? (
                  <span className="font-data text-ink/80 text-xs">
                    {text.trConfirmedAt}{" "}
                    {new Date(order.confirmedReceiptAt).toLocaleTimeString(
                      locale === "pt" ? "pt-BR" : "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="flex animate-del-pop flex-col items-start gap-3 border-[3px] border-line bg-yellow p-5 text-ink shadow-[6px_6px_0_var(--line)]">
                <span className="inline-block -rotate-3 border-[3px] border-line bg-white px-3 py-1 font-accent text-2xl text-ink leading-none tracking-wide shadow-[2px_2px_0_var(--line)] sm:text-3xl">
                  {text.trAwaitingConfirmStamp}
                </span>
                <p className="text-pretty font-bold text-base">
                  {text.trDeliveredText}
                </p>
                <div className="mt-1 flex w-full flex-col gap-2 border-2 border-line bg-paper p-3 text-ink">
                  <span className="font-bold text-sm">
                    {text.trConfirmPromptTitle}
                  </span>
                  <p className="text-pretty text-ink/80 text-xs">
                    {text.trConfirmPromptText}
                  </p>
                  <ActionButton
                    className="mt-1 flex w-full items-center justify-center gap-2 whitespace-normal px-4 py-3 text-center font-bold text-sm leading-snug break-words"
                    onClick={handleConfirmReceipt}
                    tone="yellow"
                  >
                    <span className="shrink-0 text-base">✓</span>
                    <span>{text.trConfirmBtn}</span>
                  </ActionButton>
                </div>
              </div>
            )
          ) : null}

          <div className="flex flex-col divide-y-[3px] divide-line border-[3px] border-line bg-card shadow-[6px_6px_0_var(--line)]">
            <div className="flex flex-col gap-1 p-5">
              <span className="font-data text-ink/70 text-xs uppercase">
                {text.trDeliverTo}
              </span>
              <strong className="text-ink text-lg">
                {order.address?.label || "Casa"}
              </strong>
              <span className="text-ink/80 text-sm">
                {order.address
                  ? formatAddressLine(order.address)
                  : text.trNoAddr}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-5">
              <span className="font-data text-ink/70 text-xs uppercase">
                {order.items.length}{" "}
                {order.items.length === 1
                  ? locale === "pt"
                    ? "livro"
                    : "book"
                  : locale === "pt"
                    ? "livros"
                    : "books"}
              </span>
              <span className="text-ink/90 text-sm leading-relaxed">
                {order.items.map((i) => i.title[locale]).join(", ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5">
              <div className="flex flex-col gap-1">
                <span className="font-data text-ink/70 text-xs uppercase">
                  {text.trOrdered}
                </span>
                <strong className="text-ink text-sm">
                  {new Date(order.createdAt).toLocaleDateString(
                    locale === "pt" ? "pt-BR" : "en-US",
                    { day: "numeric", month: "short" }
                  )}
                </strong>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-data text-ink/70 text-xs uppercase">
                  {text.trPay}
                </span>
                <strong className="text-ink text-sm uppercase">
                  {order.method === "card"
                    ? text.payCard
                    : order.method === "pix"
                      ? text.payPix
                      : text.none}
                </strong>
              </div>
            </div>
          </div>

          {arrived ? null : (
            <div className="flex flex-col items-start gap-2 border-[3px] border-line border-dashed bg-paper p-4">
              <ActionButton onClick={handleSkipStage} tone="yellow">
                {text.trSkip} →
              </ActionButton>
              <span className="font-data text-ink/70 text-xs">
                {text.trProto}
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
