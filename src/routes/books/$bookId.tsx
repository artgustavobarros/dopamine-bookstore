import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ActionButton } from "@/components/store/action-button";
import { BookCover } from "@/components/store/book-cover";
import { EmptyState } from "@/components/store/layout";
import { Textarea } from "@/components/ui/textarea";
import {
  type Book,
  formatNumber,
  formatPrice,
  genreLabels,
  type Locale,
  readingHours,
} from "@/lib/catalog";
import { t } from "@/lib/i18n";
import {
  gsap,
  useGSAP,
  useInsertedPanelMotion,
  useRouteEntrance,
  withMotion,
} from "@/lib/motion";
import { bookQuery } from "@/lib/open-library";
import {
  handleAddBookWithMilestones,
  handleToggleWishWithMilestones,
} from "@/lib/roast-trigger";
import {
  getCartBooks,
  getWishlistBooks,
  type Review,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/books/$bookId")({
  component: BookDetail,
});

const reviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  text: z.string().trim().min(1),
});
type ReviewFields = z.infer<typeof reviewSchema>;
const emptyReviews: Review[] = [];

function BookMetadata({ book, locale }: { book: Book; locale: Locale }) {
  const text = t(locale);
  const { pages } = book;
  return (
    <div className="grid w-full grid-cols-3 border-[3px] border-line bg-surface">
      <div className="border-line border-r-[3px] p-3 sm:p-5">
        <span className="block font-data text-[10px] uppercase sm:text-xs">
          {text.pages}
        </span>
        <strong className="font-display text-xl sm:text-2xl">
          {pages === null ? "—" : formatNumber(pages, locale)}
        </strong>
      </div>
      <div className="border-line border-r-[3px] p-3 sm:p-5">
        <span className="block font-data text-[10px] uppercase sm:text-xs">
          {text.reading}
        </span>
        <strong className="font-display text-xl sm:text-2xl">
          {pages === null ? "—" : `~${readingHours(pages)}h`}
        </strong>
      </div>
      <div className="p-3 sm:p-5">
        <span className="block font-data text-[10px] uppercase sm:text-xs">
          {text.sessions}
        </span>
        <strong className="font-display text-xl sm:text-2xl">
          {pages === null ? "—" : Math.ceil(pages / 20)}
        </strong>
      </div>
    </div>
  );
}

function BookDetail() {
  const route = useRouteEntrance<HTMLDivElement>();
  const addLabel = useRef<HTMLSpanElement>(null);
  const wishIcon = useRef<HTMLSpanElement>(null);
  const lastCart = useRef<boolean | null>(null);
  const lastWish = useRef<boolean | null>(null);
  const { bookId } = Route.useParams();
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const cartIds = useStore((state) => state.cartIds);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const reviewsByBook = useStore((state) => state.reviews);
  const reviews = reviewsByBook[bookId] ?? emptyReviews;
  const hydrated = useStore((state) => state.hydrated);
  const refreshBooks = useStore((state) => state.refreshBooks);
  const query = useQuery({ ...bookQuery(bookId, locale), enabled: hydrated });
  const book = query.data?.status === "available" ? query.data.book : null;
  useEffect(() => {
    if (book) {
      refreshBooks([book]);
    }
  }, [book, refreshBooks]);
  const addCart = useStore((state) => state.addCart);
  const toggleWish = useStore((state) => state.toggleWish);
  const addReview = useStore((state) => state.addReview);
  const text = t(locale);
  const form = useForm<ReviewFields>({
    defaultValues: { stars: 5, text: "" },
    resolver: zodResolver(reviewSchema),
  });
  useInsertedPanelMotion(route, [hydrated, Boolean(profile), bookId]);
  const inCart = Boolean(book && cartIds.includes(book.id));
  const wished = Boolean(book && wishlistIds.includes(book.id));
  useGSAP(
    () => {
      if (!(hydrated && book)) {
        return;
      }
      const previousCart = lastCart.current;
      const previousWish = lastWish.current;
      lastCart.current = inCart;
      lastWish.current = wished;
      return withMotion(() => {
        if (
          previousCart !== null &&
          previousCart !== inCart &&
          addLabel.current
        ) {
          gsap.fromTo(
            addLabel.current,
            { scale: 0.6 },
            {
              clearProps: "transform",
              duration: 0.3,
              ease: "back.out(1.8)",
              scale: 1,
            }
          );
        }
        if (
          previousWish !== null &&
          previousWish !== wished &&
          wishIcon.current
        ) {
          gsap.fromTo(
            wishIcon.current,
            { scale: 0.4 },
            {
              clearProps: "transform",
              duration: 0.35,
              ease: "back.out(2)",
              scale: 1,
            }
          );
        }
      });
    },
    {
      dependencies: [hydrated, inCart, wished, bookId],
      revertOnUpdate: true,
      scope: route,
    }
  );

  if (!hydrated || query.isPending) {
    return (
      <div
        aria-busy="true"
        className="mx-auto max-w-5xl px-5 pt-14"
        ref={route}
      >
        {text.loadingBooks}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-14" ref={route}>
        <EmptyState
          action={text.retry}
          description={text.remoteErrorDetail}
          onAction={() => query.refetch()}
          title={text.remoteError}
        />
      </div>
    );
  }
  if (!book) {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-14" ref={route}>
        <EmptyState
          action={text.goHome}
          title={
            query.data?.status === "language-unavailable"
              ? text.languageUnavailable
              : text.notFound
          }
        />
      </div>
    );
  }

  const sampleReviews =
    locale === "pt"
      ? [
          {
            name: "Leitor anônimo",
            stars: 5,
            text: "Comprei há dois anos. Fica lindo na estante.",
          },
          {
            name: "Marina, 31",
            stars: 4,
            text: "Li as primeiras páginas. Recomendo muito.",
          },
        ]
      : [
          {
            name: "Anonymous reader",
            stars: 5,
            text: "Bought it two years ago. Looks great on the shelf.",
          },
          {
            name: "Marina, 31",
            stars: 4,
            text: "Read the first few pages. Highly recommend.",
          },
        ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-6" ref={route}>
      <Link
        className="inline-flex border-line border-b-2 pb-1 font-bold text-sm hover:text-[#a91f22] dark:hover:text-[#ff8680]"
        to="/"
      >
        ← {text.backCatalog}
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14">
        <BookCover book={book} large locale={locale} />
        <div className="flex flex-col items-start gap-5">
          <span className="border-[2px] border-line bg-yellow px-3 py-1 font-bold font-data text-[#141210] text-xs">
            {genreLabels[book.genre][locale]}
          </span>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            {book.title[locale]}
          </h1>
          <p className="font-semibold text-xl">
            {book.author[locale]}
            {book.year !== null && ` · ${book.year}`}
          </p>
          <BookMetadata book={book} locale={locale} />
          <p className="max-w-[55ch] text-lg leading-relaxed">
            {book.description[locale]}
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            <strong className="font-display text-3xl">
              {formatPrice(book.price, locale)}
            </strong>
            {book.oldPrice !== undefined && (
              <del className="opacity-70">
                {formatPrice(book.oldPrice, locale)}
              </del>
            )}
          </div>
          <span className="font-data text-xs uppercase">{text.demoPrice}</span>
          <div className="flex flex-wrap gap-4">
            <ActionButton
              disabled={!hydrated}
              onClick={async () => {
                if (inCart) {
                  toast.info(text.duplicateToast);
                  return;
                }
                const cartBooks = getCartBooks(
                  useStore.getState().cartIds,
                  useStore.getState().bookCache
                );
                const added = addCart(book);
                if (added) {
                  toast.info(text.addedToast);
                  await handleAddBookWithMilestones({
                    book,
                    cartBooks,
                    locale,
                    onAddedSuccess: () => true,
                    onDuplicate: () => undefined,
                  });
                }
              }}
            >
              <span className="inline-block" ref={addLabel}>
                {inCart ? text.inCart : text.addCart}
              </span>
            </ActionButton>
            <ActionButton
              aria-pressed={wished}
              disabled={!hydrated}
              onClick={async () => {
                const wishlistBooks = getWishlistBooks(
                  useStore.getState().wishlistIds,
                  useStore.getState().bookCache
                );
                if (toggleWish(book)) {
                  toast.info(text.wishToast);
                  await handleToggleWishWithMilestones({
                    book,
                    locale,
                    wishlistBooks,
                  });
                }
              }}
              tone={wished ? "yellow" : "surface"}
            >
              <span className="inline-flex" ref={wishIcon}>
                <Heart className={wished ? "fill-[#141210]" : ""} />
              </span>
              {wished ? text.removeWish : text.saveWish}
            </ActionButton>
          </div>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="border-line border-b-[3px] pb-3 font-display text-3xl">
          {text.reviews}
        </h2>
        {hydrated && profile ? (
          <form
            className="mt-6 flex flex-col gap-4 border-[3px] border-line bg-surface p-5 shadow-[6px_6px_0_var(--line)]"
            data-motion-panel
            onSubmit={form.handleSubmit(({ stars, text: reviewText }) => {
              addReview(book.id, stars, reviewText);
              form.reset();
              toast.success(text.reviewToast);
            })}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <strong>{text.reviewPrompt}</strong>
              <fieldset className="flex gap-1">
                <legend className="sr-only">{text.ratingError}</legend>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    aria-label={`${rating} / 5`}
                    aria-pressed={form.watch("stars") === rating}
                    className="p-1 text-red"
                    key={rating}
                    onClick={() =>
                      form.setValue("stars", rating, { shouldValidate: true })
                    }
                    type="button"
                  >
                    <Star
                      className={
                        rating <= form.watch("stars") ? "fill-red" : ""
                      }
                      size={27}
                    />
                  </button>
                ))}
              </fieldset>
            </div>
            <Textarea
              {...form.register("text")}
              className="rounded-none border-2 border-line bg-paper text-base"
              placeholder={text.reviewPlaceholder}
              rows={3}
            />
            {Boolean(form.formState.errors.text) && (
              <p
                className="font-semibold text-[#a91f22] text-sm dark:text-[#ff8680]"
                role="alert"
              >
                {text.reviewError}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-data text-xs">
                {text.signedAs} {profile.name}
              </span>
              <ActionButton type="submit">{text.publish}</ActionButton>
            </div>
          </form>
        ) : (
          <div
            className="mt-6 flex flex-wrap items-center justify-between gap-4 border-[3px] border-line border-dashed p-5"
            data-motion-panel
          >
            <p className="font-semibold">{text.signInReview}</p>
            <ActionButton asChild tone="surface">
              <Link search={{ returnTo: `/books/${book.id}` }} to="/account">
                {text.account}
              </Link>
            </ActionButton>
          </div>
        )}
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            ...reviews,
            ...sampleReviews.map((review, index) => ({
              ...review,
              id: `sample-${index}`,
            })),
          ].map((review) => (
            <article
              className="border-[3px] border-line bg-surface p-5 shadow-[4px_4px_0_var(--line)]"
              key={review.id}
            >
              <div className="flex items-start justify-between gap-3">
                <strong>{review.name}</strong>
                <span
                  aria-label={`${review.stars} / 5`}
                  className="whitespace-nowrap text-red"
                  role="img"
                >
                  {"★".repeat(review.stars)}
                  {"☆".repeat(5 - review.stars)}
                </span>
              </div>
              <p className="mt-3 leading-relaxed">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
