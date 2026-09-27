import type { Book, Locale } from "@/lib/catalog";
import { genreColors } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function BookCover({
  book,
  locale,
  large = false,
  className,
}: {
  book: Book;
  locale: Locale;
  large?: boolean;
  className?: string;
}) {
  const hasOld = book.oldPrice !== undefined;
  const isEn = locale === "en";

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden text-ink",
        large
          ? "border-[3px] border-line shadow-[8px_8px_0_var(--line)]"
          : "border-line border-b-[3px]",
        genreColors[book.genre] || "bg-yellow",
        className
      )}
    >
      {/* Halftone radial pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(14.7%_0.004_49.25/0.22)_1.2px,transparent_1.6px)] bg-[size:8px_8px]"
      />

      {/* Cover content (graphic typography fallback) */}
      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          large ? "p-6" : "p-3.5"
        )}
      >
        <div
          className={cn(
            "border-2 border-line bg-card font-display text-ink leading-tight shadow-[4px_4px_0_var(--line)]",
            large ? "p-4 text-2xl sm:text-3xl" : "p-2.5 text-base sm:text-lg"
          )}
        >
          {book.title[locale]}
        </div>

        <div className="flex items-end justify-between gap-2">
          <span className="w-fit max-w-[70%] truncate bg-ink px-2 py-1 font-semibold text-paper text-xs">
            {book.author[locale]}
          </span>
        </div>
      </div>

      {/* Real cover image from OpenLibrary if coverId exists */}
      {book.coverId ? (
        <img
          alt={book.title[locale]}
          className="absolute inset-0 h-full w-full object-cover"
          height={large ? 480 : 300}
          loading="lazy"
          src={`https://covers.openlibrary.org/b/id/${book.coverId}-${large ? "L" : "M"}.jpg`}
          width={large ? 320 : 200}
        />
      ) : null}

      {/* SALE / PROMO badge always on top */}
      {hasOld && (
        <span className="absolute right-3 bottom-3 z-10 rotate-6 border-2 border-line bg-yellow px-2 py-0.5 font-accent text-base text-ink tracking-wide shadow-[2px_2px_0_var(--line)]">
          {isEn ? "SALE!" : "PROMO!"}
        </span>
      )}
    </div>
  );
}
