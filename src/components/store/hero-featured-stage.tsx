import { type Book, formatNumber, type Locale } from "@/lib/catalog";
import type { t } from "@/lib/i18n";

export function HeroFeaturedStage({
  className = "",
  featured,
  isHeroLoading,
  locale,
  text,
}: {
  className?: string;
  featured: Book[];
  isHeroLoading: boolean;
  locale: Locale;
  text: ReturnType<typeof t>;
}) {
  const totalPages = featured.reduce((sum, book) => sum + (book.pages ?? 0), 0);

  return (
    <div
      className={`relative mx-auto aspect-[1.46] w-full max-w-[610px] border-[3px] border-line bg-blue text-[#141210] shadow-[7px_7px_0_var(--line)] ${className}`}
      data-hero-loading={isHeroLoading ? "true" : undefined}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[length:11px_11px] bg-[radial-gradient(#14121066_1.3px,transparent_1.5px)] ${
          isHeroLoading ? "hero-dots-wave" : ""
        }`}
      />
      {!isHeroLoading && (
        <>
          {featured.map((book, index) => (
            <div
              className={`absolute flex aspect-[0.7] w-[33%] flex-col justify-end overflow-hidden border-[#141210] border-[3px] bg-[#141210] p-2 shadow-[5px_5px_0_#141210] sm:p-3 ${index === 0 ? "top-[22%] left-[15%] -rotate-[8deg]" : index === 1 ? "top-[17%] left-[40%] z-10 rotate-[2deg]" : "top-[21%] left-[63%] rotate-[9deg]"}`}
              data-hero-book
              key={book.id}
            >
              {book.coverId ? (
                <img
                  alt={book.title[locale]}
                  className="absolute inset-0 h-full w-full object-cover"
                  height={300}
                  src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                  width={200}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#141210] bg-[length:10px_10px] bg-[radial-gradient(#ffffff22_1.4px,transparent_1.5px)]"
                />
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-transparent to-transparent"
              />
              <span className="relative z-10 w-fit bg-[#141210] px-1 py-0.5 font-data text-[9px] text-white sm:px-2 sm:text-xs">
                {book.pages === null
                  ? text.pagesUnknown
                  : `${formatNumber(book.pages, locale)} p.`}
              </span>
            </div>
          ))}
          <div
            className="absolute top-[6%] right-[4%] z-20 flex size-21 rotate-12 flex-col items-center justify-center rounded-full border-[#141210] border-[3px] bg-yellow text-center font-display leading-none sm:size-28"
            data-hero-seal
          >
            <span className="text-lg sm:text-2xl">R$ 0,00</span>
            <span className="mt-1 font-accent text-xs sm:text-base">
              {locale === "pt" ? "DE VERDADE" : "FOR REAL"}
            </span>
          </div>
          <p
            className="absolute bottom-[4%] left-[4%] z-20 max-w-[45%] border-[#141210] border-[3px] bg-white px-2 py-1 font-bold font-data text-[9px] shadow-[4px_4px_0_#141210] sm:px-3 sm:py-2 sm:text-xs"
            data-hero-status
          >
            {locale === "pt"
              ? `Em destaque: ${formatNumber(totalPages, locale)} páginas que você não vai ler.`
              : `Featured: ${formatNumber(totalPages, locale)} pages you won't read.`}
          </p>
        </>
      )}
    </div>
  );
}
