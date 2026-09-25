import type { Book, Locale } from "@/lib/catalog";
import { genreColors } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function BookCover({
  book,
  locale,
  large = false,
}: {
  book: Book;
  locale: Locale;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] overflow-hidden border-[3px] border-line text-[#141210] shadow-[6px_6px_0_var(--line)]",
        genreColors[book.genre]
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[length:10px_10px] bg-[radial-gradient(#14121033_1.4px,transparent_1.5px)]"
      />
      <div className="relative flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
        <div
          className={cn(
            "border-[#141210] border-[3px] bg-white p-3 font-display leading-[1.04] tracking-tight shadow-[4px_4px_0_#141210]",
            large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
          )}
        >
          {book.title[locale]}
        </div>
        <span className="w-fit max-w-full bg-[#141210] px-2 py-1 font-semibold text-sm text-white">
          {book.author[locale]}
        </span>
      </div>
    </div>
  );
}
