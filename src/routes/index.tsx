import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { BookCard } from "@/components/store/book-card";
import { EmptyState } from "@/components/store/layout";
import { Input } from "@/components/ui/input";
import {
  type CatalogFilters,
  catalogAuthors,
  filterBooks,
  formatNumber,
  type Genre,
  genreLabels,
  genres,
} from "@/lib/catalog";
import { t } from "@/lib/i18n";
import {
  gsap,
  POINTER_QUERY,
  ScrollTrigger,
  useGSAP,
  withMotion,
} from "@/lib/motion";
import { catalogQuery } from "@/lib/open-library";
import {
  triggerCategorySwitchRoast,
  triggerSearchRoast,
} from "@/lib/roast-trigger";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

const defaultFilters: CatalogFilters = {
  author: "all",
  genre: "all",
  length: "all",
  price: "all",
  query: "",
};

function Home() {
  const hero = useRef<HTMLElement>(null);
  const locale = useStore((state) => state.locale);
  const hydrated = useStore((state) => state.hydrated);
  const refreshBooks = useStore((state) => state.refreshBooks);
  const text = t(locale);
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(
      () => setSearchTerm(filters.query.trim()),
      700
    );
    return () => window.clearTimeout(timer);
  }, [filters.query]);
  const query = useQuery({
    ...catalogQuery(locale, searchTerm),
    enabled: hydrated,
  });
  const isSearchPending = filters.query.trim() !== searchTerm;
  const books = isSearchPending ? [] : (query.data ?? []);
  const filtered = filterBooks(books, filters);
  const authors = catalogAuthors(books);
  const filteredIds = filtered.map((book) => book.id).join(",");
  const featured = books.slice(0, 3);
  const featuredIds = featured.map((book) => book.id).join(",");
  useEffect(() => {
    if (query.data) {
      refreshBooks(query.data);
    }
  }, [query.data, refreshBooks]);
  const categorySwitchCount = useRef(0);
  const categoryRoastFired = useRef(false);
  const searchCount = useRef(0);
  const searchRoastFired = useRef(false);
  const prevSearchTerm = useRef("");

  useEffect(() => {
    if (searchTerm && searchTerm !== prevSearchTerm.current) {
      prevSearchTerm.current = searchTerm;
      searchCount.current += 1;
      if (searchCount.current > 3 && !searchRoastFired.current) {
        searchRoastFired.current = true;
        triggerSearchRoast({
          locale,
          query: searchTerm,
          searchCount: searchCount.current,
        });
      }
    }
  }, [searchTerm, locale]);

  const update = <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K]
  ) => setFilters((old) => ({ ...old, [key]: value }));

  const onSelectGenre = (genre: CatalogFilters["genre"]) => {
    if (genre !== filters.genre) {
      const oldGenre = filters.genre;
      update("genre", genre);
      categorySwitchCount.current += 1;
      if (categorySwitchCount.current > 3 && !categoryRoastFired.current) {
        categoryRoastFired.current = true;
        triggerCategorySwitchRoast({
          categorySwitches: categorySwitchCount.current,
          genreFrom: oldGenre,
          genreTo: genre,
          locale,
        });
      }
    }
  };

  useGSAP(
    () =>
      withMotion(() => {
        const root = hero.current;
        if (!root?.isConnected) {
          return;
        }
        const timeline = gsap.timeline({ defaults: { ease: "back.out(1.2)" } });
        timeline
          .from(
            root.querySelectorAll("[data-hero-badge]"),
            {
              autoAlpha: 0,
              clearProps: "opacity,visibility,transform",
              duration: 0.5,
              rotation: -12,
              scale: 1.8,
            },
            0.15
          )
          .from(
            root.querySelectorAll("[data-hero-line]"),
            {
              autoAlpha: 0,
              clearProps: "opacity,visibility,transform",
              duration: 0.5,
              stagger: 0.1,
              y: 14,
            },
            0.2
          )
          .from(
            root.querySelectorAll("[data-hero-seal]"),
            {
              autoAlpha: 0,
              clearProps: "opacity,visibility,transform",
              duration: 0.6,
              rotation: -200,
              scale: 0,
            },
            0.7
          );
        timeline.eventCallback("onComplete", () => {
          root.dataset.heroReady = "true";
        });
        return () => {
          delete root.dataset.heroReady;
        };
      }),
    { scope: hero }
  );

  useGSAP(
    () =>
      withMotion(() => {
        const cards = hero.current?.querySelectorAll("[data-hero-book]");
        if (cards?.length) {
          gsap.from(cards, {
            autoAlpha: 0,
            clearProps: "opacity,visibility,transform",
            duration: 0.55,
            ease: "back.out(1.2)",
            stagger: 0.1,
            y: -60,
          });
        }
      }),
    { dependencies: [featuredIds], revertOnUpdate: true, scope: hero }
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(POINTER_QUERY, () => {
        const root = hero.current;
        if (!root?.isConnected) {
          return;
        }
        const featuredBooks = Array.from(
          root.querySelectorAll<HTMLElement>("[data-hero-book]")
        );
        const removeListeners = featuredBooks.map((element, index) => {
          const restingRotation = Number(gsap.getProperty(element, "rotation"));
          const x = gsap.quickTo(element, "x", {
            duration: 0.2,
            ease: "power2.out",
          });
          const y = gsap.quickTo(element, "y", {
            duration: 0.2,
            ease: "power2.out",
          });
          const rotation = gsap.quickTo(element, "rotation", {
            duration: 0.2,
            ease: "power2.out",
          });
          const onEnter = () => {
            if (root.dataset.heroReady !== "true") {
              return;
            }
            x(index === 1 ? 3 : -3);
            y(-7);
            rotation(restingRotation + (index === 1 ? 2 : -2));
          };
          const onMove = (event: PointerEvent) => {
            if (root.dataset.heroReady !== "true") {
              return;
            }
            const rect = element.getBoundingClientRect();
            const offset = (event.clientX - rect.left) / rect.width - 0.5;
            x(offset * 7);
            rotation(restingRotation + offset * 5);
          };
          const onLeave = () => {
            x(0);
            y(0);
            rotation(restingRotation);
          };
          element.addEventListener("pointerenter", onEnter);
          element.addEventListener("pointermove", onMove);
          element.addEventListener("pointerleave", onLeave);
          return () => {
            element.removeEventListener("pointerenter", onEnter);
            element.removeEventListener("pointermove", onMove);
            element.removeEventListener("pointerleave", onLeave);
            gsap.set(element, { clearProps: "transform" });
          };
        });
        return () => {
          for (const remove of removeListeners) {
            remove();
          }
        };
      });
      return () => media.revert();
    },
    { dependencies: [featuredIds], revertOnUpdate: true, scope: hero }
  );

  useGSAP(
    () => {
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(frame);
    },
    { dependencies: [filteredIds], revertOnUpdate: true }
  );

  return (
    <>
      <section className="overflow-hidden bg-paper" ref={hero}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-9 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-12">
          <div className="relative z-10">
            <span
              className="inline-block -rotate-2 border-[#141210] border-[3px] bg-red px-3 py-1 font-accent text-lg text-white shadow-[3px_3px_0_#141210] sm:text-xl"
              data-hero-badge
            >
              {text.heroBadge}
            </span>
            <h1 className="mt-6 font-display text-[clamp(3.7rem,7.6vw,7.5rem)] leading-[0.9] tracking-[-0.06em]">
              <span className="block" data-hero-line>
                {text.heroA}
              </span>
              <span className="block" data-hero-line>
                {text.heroB}
              </span>
            </h1>
            <p className="mt-6 max-w-[35ch] font-semibold text-lg leading-snug sm:text-xl">
              {text.heroTag}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <ActionButton asChild className="text-base">
                <a href="#catalog">{text.seeCatalog}</a>
              </ActionButton>
              <ActionButton asChild className="text-base" tone="surface">
                <Link to="/stats">{text.myStats}</Link>
              </ActionButton>
            </div>
          </div>
          <div className="relative mx-auto aspect-[1.46] w-full max-w-[610px] border-[3px] border-line bg-blue text-[#141210] shadow-[7px_7px_0_var(--line)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[length:11px_11px] bg-[radial-gradient(#14121066_1.3px,transparent_1.5px)]"
            />
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
            <p className="absolute bottom-[4%] left-[4%] z-20 max-w-[45%] border-[#141210] border-[3px] bg-white px-2 py-1 font-bold font-data text-[9px] shadow-[4px_4px_0_#141210] sm:px-3 sm:py-2 sm:text-xs">
              {locale === "pt"
                ? `Em destaque: ${formatNumber(
                    featured.reduce((sum, book) => sum + (book.pages ?? 0), 0),
                    locale
                  )} páginas que você não vai ler.`
                : `Featured: ${formatNumber(
                    featured.reduce((sum, book) => sum + (book.pages ?? 0), 0),
                    locale
                  )} pages you won't read.`}
            </p>
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-14 sm:px-6"
        id="catalog"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-line border-b-[3px] pb-3">
          <h2 className="font-display text-4xl sm:text-5xl">{text.catalog}</h2>
          <span className="font-bold font-data text-xs">
            {filtered.length} {text.booksFound}
          </span>
        </div>
        <div className="mb-5 flex gap-3">
          <label className="relative block flex-1" htmlFor="catalog-search">
            <span className="sr-only">{text.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <Input
              className="h-12 rounded-none border-[3px] border-line bg-surface pl-12 text-base shadow-[3px_3px_0_var(--line)]"
              id="catalog-search"
              onChange={(event) => update("query", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSearchTerm(filters.query.trim());
                }
              }}
              placeholder={text.search}
              value={filters.query}
            />
          </label>
          <div className="hidden items-center gap-2 border-[3px] border-line bg-surface px-4 font-bold font-data text-xs sm:flex">
            <SlidersHorizontal size={17} />
            {text.genre}
          </div>
        </div>
        <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-3 sm:mx-0 sm:flex-wrap sm:px-0">
          {(["all", ...genres] as const).map((genre) => (
            <button
              className={`shrink-0 border-[2px] border-line px-3 py-2 font-bold text-sm transition-colors hover:bg-yellow hover:text-[#141210] ${filters.genre === genre ? "bg-ink text-paper" : "bg-surface"}`}
              key={genre}
              onClick={() => onSelectGenre(genre)}
              type="button"
            >
              {genre === "all" ? text.all : genreLabels[genre as Genre][locale]}
            </button>
          ))}
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-bold text-xs">
            <span>{text.price}</span>
            <select
              aria-label={text.price}
              className="h-11 border-[2px] border-line bg-surface px-3 text-sm"
              onChange={(event) =>
                update("price", event.target.value as CatalogFilters["price"])
              }
              value={filters.price}
            >
              <option value="all">{text.anyPrice}</option>
              <option value="under50">{text.under50}</option>
              <option value="under100">{text.under100}</option>
              <option value="over100">{text.over100}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold text-xs">
            <span>{text.author}</span>
            <select
              aria-label={text.author}
              className="h-11 border-[2px] border-line bg-surface px-3 text-sm"
              onChange={(event) => update("author", event.target.value)}
              value={filters.author}
            >
              <option value="all">{text.allAuthors}</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold text-xs">
            <span>{text.length}</span>
            <select
              aria-label={text.length}
              className="h-11 border-[2px] border-line bg-surface px-3 text-sm"
              onChange={(event) =>
                update("length", event.target.value as CatalogFilters["length"])
              }
              value={filters.length}
            >
              <option value="all">{text.anyLength}</option>
              <option value="short">{text.short}</option>
              <option value="medium">{text.medium}</option>
              <option value="long">{text.long}</option>
            </select>
          </label>
        </div>
        {!hydrated || isSearchPending || query.isPending ? (
          <div
            aria-busy="true"
            aria-live="polite"
            className="border-[3px] border-line border-dashed bg-surface p-10 text-center font-display text-2xl"
          >
            {text.loadingBooks}
          </div>
        ) : query.isError ? (
          <EmptyState
            action={text.retry}
            description={text.remoteErrorDetail}
            onAction={() => query.refetch()}
            title={text.remoteError}
          />
        ) : books.length === 0 ? (
          <EmptyState
            action={searchTerm ? text.clearFilters : text.retry}
            onAction={() =>
              searchTerm ? setFilters(defaultFilters) : query.refetch()
            }
            title={text.remoteEmpty}
          />
        ) : filtered.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((book, index) => (
              <BookCard book={book} key={book.id} revealIndex={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            action={text.clearFilters}
            onAction={() => setFilters(defaultFilters)}
            title={text.noResults}
          />
        )}
      </section>
    </>
  );
}
