import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import type { RoastPayload } from "@/lib/roast-fallbacks";
import { generateDiagnosisFn } from "@/lib/server/roast";
import { getStats } from "@/lib/stats";
import type { Order } from "@/lib/store";
import { ActionButton } from "./action-button";

const LOADING_MESSAGES = {
  en: [
    "Consulting literary malpractice attorneys…",
    "Measuring the specific gravity of your guilt…",
    "Evaluating flimsy excuses for unread books…",
    "Writing merciless psychological prognosis…",
  ],
  pt: [
    "Consultando o CRM literário e advogados…",
    "Medindo o peso específico da sua culpa…",
    "Avaliando desculpas esfarrapadas para livros fechados…",
    "Redigindo laudo psiquiátrico impiedoso…",
  ],
};

export function ReaderRoastCard({
  hydrated,
  locale,
  orders,
}: {
  hydrated: boolean;
  locale: Locale;
  orders: Order[];
}) {
  const text = t(locale);
  const [diagnosis, setDiagnosis] = useState<RoastPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Restore cached diagnosis from session storage
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      const cached = sessionStorage.getItem("depois_eu_leio_roast_diagnosis");
      if (cached) {
        setDiagnosis(JSON.parse(cached));
      }
    } catch {
      // Ignore session storage errors
    }
  }, [hydrated]);

  // Rotate satirical loading messages while waiting
  useEffect(() => {
    if (!loading) {
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES[locale].length);
    }, 900);
    return () => clearInterval(interval);
  }, [loading, locale]);

  const handleGenerate = async () => {
    if (orders.length === 0 || loading) {
      return;
    }
    setLoading(true);
    const stats = getStats(orders);

    try {
      const result = await generateDiagnosisFn({
        data: {
          cartCount: stats.bookCount,
          event: "diagnosis",
          favoriteAuthor: stats.favoriteAuthor,
          favoriteGenre: stats.favoriteGenre,
          locale,
          pretendSpend: stats.pretendSpend,
          totalPages: stats.pages,
        },
      });

      const normalized =
        "msg" in result
          ? { roast: result.msg, tag: result.sfx }
          : result;
      setDiagnosis(normalized);
      try {
        sessionStorage.setItem(
          "depois_eu_leio_roast_diagnosis",
          JSON.stringify(normalized)
        );
      } catch {
        // Ignore session storage write errors
      }
    } catch {
      // Handled via server fallback
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div aria-busy="true" className="mt-10 h-44 animate-pulse bg-surface" />
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <section
      aria-labelledby="reader-roast-heading"
      className="mt-10 border-[3px] border-line bg-yellow p-6 text-ink shadow-[8px_8px_0_var(--line)] sm:p-8"
      data-motion-panel
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-block border border-line bg-ink px-2.5 py-0.5 font-accent text-xs text-yellow uppercase tracking-wider">
            {diagnosis?.tag || "[FRITADA LITERÁRIA]"}
          </span>
          <h2
            className="mt-2 font-display text-2xl leading-tight sm:text-3xl"
            id="reader-roast-heading"
          >
            {text.roastTitle}
          </h2>
          <p className="mt-2 max-w-[60ch] font-medium text-sm sm:text-base">
            {text.roastLead}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col items-center justify-center border-2 border-ink/40 border-dashed bg-surface/40 p-8 text-center">
          <Loader2Icon className="size-8 animate-spin text-ink" />
          <p className="mt-3 font-bold font-data text-sm">
            {LOADING_MESSAGES[locale][messageIndex]}
          </p>
        </div>
      ) : diagnosis ? (
        <div className="mt-6 border-2 border-line bg-surface p-5 text-ink shadow-[4px_4px_0_var(--line)]">
          <p className="font-body font-medium text-base leading-relaxed sm:text-lg">
            {diagnosis.roast}
          </p>
          <div className="mt-5 flex justify-end">
            <ActionButton
              className="text-xs sm:text-sm"
              disabled={loading}
              onClick={handleGenerate}
              tone="surface"
            >
              <SparklesIcon className="mr-1.5 size-4" />
              {text.roastRegen}
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="mt-6 border-2 border-ink/40 border-dashed bg-surface/30 p-6 text-center">
          <p className="font-medium text-sm sm:text-base">
            {hasOrders ? text.roastLead : text.roastEmpty}
          </p>
          {hasOrders && (
            <ActionButton
              className="mt-5 text-sm sm:text-base"
              onClick={handleGenerate}
              tone="ink"
            >
              <SparklesIcon className="mr-2 size-4" />
              {text.roastBtn}
            </ActionButton>
          )}
        </div>
      )}
    </section>
  );
}
