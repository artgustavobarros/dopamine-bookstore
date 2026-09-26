import { createFileRoute, Link } from "@tanstack/react-router";
import { ActionButton } from "@/components/store/action-button";
import {
  formatNumber,
  formatPrice,
  type Genre,
  genreLabels,
} from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import { getStats } from "@/lib/stats";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const orders = useStore((state) => state.orders);
  const hydrated = useStore((state) => state.hydrated);
  const text = t(locale);
  const stats = getStats(orders);
  const cards = [
    {
      label: text.pretendSpend,
      tone: "bg-yellow",
      value: formatPrice(stats.pretendSpend, locale),
    },
    {
      label: text.bookCount,
      tone: "bg-surface",
      value: formatNumber(stats.bookCount, locale),
    },
    {
      label: text.pageCount,
      tone: "bg-surface",
      value: formatNumber(stats.pages, locale),
    },
    {
      label: text.hourCount,
      tone: "bg-blue text-[#141210]",
      value: `${formatNumber(stats.hours, locale)}h`,
    },
    {
      label: text.favoriteGenre,
      tone: "bg-pink text-[#141210]",
      value: stats.favoriteGenre
        ? (genreLabels[stats.favoriteGenre as Genre]?.[locale] ??
          stats.favoriteGenre)
        : "—",
    },
    {
      label: text.averageLength,
      tone: "bg-green text-[#141210]",
      value:
        stats.bookCount > 0
          ? `${formatNumber(stats.averagePages, locale)} p.`
          : "—",
    },
  ];
  useInsertedPanelMotion(route, [hydrated, stats.orderCount]);
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <div className="border-[3px] border-line bg-ink p-7 text-paper shadow-[8px_8px_0_#ffd84a] sm:p-10">
        <h1 className="max-w-[16ch] font-display text-4xl leading-tight sm:text-6xl">
          {text.statsTitle}
        </h1>
        <p className="mt-5 max-w-[55ch] text-lg">{text.statsLead}</p>
      </div>
      {hydrated ? (
        <>
          <div
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            data-motion-panel
          >
            {cards.map((card) => (
              <article
                className={`min-h-40 border-[3px] border-line p-5 shadow-[5px_5px_0_var(--line)] ${card.tone}`}
                key={card.label}
              >
                <h2 className="font-bold font-data text-xs uppercase">
                  {card.label}
                </h2>
                <p className="mt-7 break-words font-display text-3xl sm:text-4xl">
                  {card.value}
                </p>
              </article>
            ))}
          </div>
          {stats.orderCount === 0 && (
            <div className="mt-10 border-[3px] border-line border-dashed p-7 text-center">
              <p className="font-semibold">{text.noStats}</p>
              <ActionButton asChild className="mt-5">
                <Link to="/">{text.seeCatalog}</Link>
              </ActionButton>
            </div>
          )}
        </>
      ) : (
        <div aria-busy="true" className="mt-10 h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
