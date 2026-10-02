import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { BookCard } from "@/components/store/book-card";
import { HeroFeaturedStage } from "@/components/store/hero-featured-stage";
import { EmptyState } from "@/components/store/layout";
import { Input } from "@/components/ui/input";
import {
  type CatalogFilters,
  catalogAuthors,
  filterBooks,
  type Genre,
  genreLabels,
  genres,
} from "@/lib/catalog";
import { heroCoverUrl } from "@/lib/hero-covers";
import { t } from "@/lib/i18n";
import {
  gsap,
  POINTER_QUERY,
  ScrollTrigger,
  useGSAP,
  withMotion,
} from "@/lib/motion";
import { catalogQuery } from "@/lib/open-library";
import { homeStructuredData, siteUrl } from "@/lib/seo";
import { getDefaultCatalogFn } from "@/lib/server/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getDefaultCatalogFn(),
  head: ({ loaderData }) => ({
    links: [
      { href: `${siteUrl}/`, rel: "canonical" },
      ...(loaderData?.[2]?.coverId
        ? [
            {
              as: "image",
              fetchPriority: "high" as const,
              href: heroCoverUrl(loaderData[2].coverId),
              rel: "preload",
            },
          ]
        : []),
    ],
    meta: [
      { content: "index, follow, max-image-preview:large", name: "robots" },
      { content: `${siteUrl}/`, property: "og:url" },
    ],
    scripts: [
      {
        children: JSON.stringify(homeStructuredData),
        type: "application/ld+json",
      },
    ],
  }),
  staleTime: 60 * 60 * 1000,
});

const defaultFilters: CatalogFilters = {
  author: "all",
  genre: "all",
  length: "all",
  price: "all",
  query: "",
};

function Home() {
  const initialBooks = Route.useLoaderData();
  const hero = useRef<HTMLElement>(null);
  const locale = useStore((state) => state.locale);
  const hydrated = useStore((state) => state.hydrated);
  const refreshBooks = useStore((state) => state.refreshBooks);
  const text = t(locale);
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [visibleCount, setVisibleCount] = useState(12);
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
    initialData:
      locale === "pt" && searchTerm === "" && initialBooks.length > 0
        ? initialBooks
        : undefined,
  });
  const isSearchPending = filters.query.trim() !== searchTerm;
  const books = isSearchPending ? [] : (query.data ?? []);
  const filtered = filterBooks(books, filters);
  const visibleBooks = filtered.slice(0, visibleCount);
  const authors = catalogAuthors(books);
  const filteredIds = filtered.map((book) => book.id).join(",");
  const featured = books.slice(0, 3);
  const featuredIds = featured.map((book) => book.id).join(",");
  const isHeroLoading =
    (!hydrated || query.isLoading || query.isPending) && featured.length === 0;
  useEffect(() => {
    if (query.data) {
      refreshBooks(query.data);
    }
  }, [query.data, refreshBooks]);
  const explorationCount = useRef(0);
  const prevSearchTerm = useRef("");

  const handleExplorationAction = useCallback(
    (
      filterType: "query" | "genre" | "price" | "author" | "length",
      nextValue: string,
      prevValue?: string
    ) => {
      if (nextValue === prevValue) {
        return;
      }
      explorationCount.current += 1;
      if (explorationCount.current % 3 === 0) {
        import("@/lib/roast-trigger").then(({ triggerExplorationRoast }) =>
          triggerExplorationRoast({
            filterPreviousValue: prevValue,
            filterType,
            filterValue: nextValue,
            locale,
            searchCount: explorationCount.current,
          })
        );
      }
    },
    [locale]
  );

  useEffect(() => {
    if (searchTerm && searchTerm !== prevSearchTerm.current) {
      const oldTerm = prevSearchTerm.current;
      prevSearchTerm.current = searchTerm;
      handleExplorationAction("query", searchTerm, oldTerm);
    }
  }, [searchTerm, handleExplorationAction]);

  const update = <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K]
  ) => {
    const oldValue = filters[key];
    if (oldValue !== value) {
      setFilters((old) => ({ ...old, [key]: value }));
      setVisibleCount(12);
      if (key === "price" || key === "author" || key === "length") {
        handleExplorationAction(key, String(value), String(oldValue));
      }
    }
  };

  const onSelectGenre = (genre: CatalogFilters["genre"]) => {
    if (genre !== filters.genre) {
      const oldGenre = filters.genre;
      setFilters((old) => ({ ...old, genre }));
      setVisibleCount(12);
      handleExplorationAction("genre", genre, oldGenre);
    }
  };

  useGSAP(
    () =>
      withMotion(() => {
        const root = hero.current;
        if (!root?.isConnected) {
          return;
        }
        const cards = root.querySelectorAll("[data-hero-book]");
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
        const seal = root.querySelectorAll("[data-hero-seal]");
        if (seal?.length) {
          gsap.from(seal, {
            autoAlpha: 0,
            clearProps: "opacity,visibility,transform",
            duration: 0.6,
            ease: "back.out(1.2)",
            rotation: -200,
            scale: 0,
          });
        }
        const status = root.querySelectorAll("[data-hero-status]");
        if (status?.length) {
          gsap.from(status, {
            autoAlpha: 0,
            clearProps: "opacity,visibility,transform",
            duration: 0.45,
            ease: "power2.out",
            y: 10,
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
            x(index === 1 ? 3 : -3);
            y(-7);
            rotation(restingRotation + (index === 1 ? 2 : -2));
          };
          const onMove = (event: PointerEvent) => {
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
          <HeroFeaturedStage
            featured={featured}
            isHeroLoading={isHeroLoading}
            locale={locale}
            text={text}
          />
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
        <div className="mb-5">
          <label className="relative block w-full" htmlFor="catalog-search">
            <span className="sr-only">{text.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <Input
              className="h-12 w-full rounded-none border-[3px] border-line bg-surface pl-12 text-base shadow-[3px_3px_0_var(--line)]"
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
        {isSearchPending || query.isPending ? (
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
          <div>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleBooks.map((book, index) => (
                <BookCard book={book} key={book.id} revealIndex={index} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-10 flex justify-center">
                <ActionButton
                  onClick={() => setVisibleCount((count) => count + 12)}
                  tone="surface"
                >
                  {text.loadMoreBooks}
                </ActionButton>
              </div>
            )}
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
