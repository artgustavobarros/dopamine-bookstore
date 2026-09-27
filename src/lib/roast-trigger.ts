import type { Book, Locale } from "./catalog";
import { showRoastToast } from "./roast-toast";
import { generateRoastFn } from "./server/roast";

function isRussianAuthor(book: Book): boolean {
  const author = `${book.author.pt} ${book.author.en}`.toLowerCase();
  return (
    author.includes("dostoi") ||
    author.includes("tolst") ||
    author.includes("tchékhov") ||
    author.includes("chekhov") ||
    author.includes("gogol") ||
    author.includes("gógol") ||
    author.includes("turgen")
  );
}

export async function handleAddBookWithMilestones({
  book,
  cartBooks,
  locale,
  onAddedSuccess,
  onDuplicate,
}: {
  book: Book;
  cartBooks: Book[];
  locale: Locale;
  onAddedSuccess: () => boolean;
  onDuplicate: () => void;
}) {
  const isAlreadyInCart = cartBooks.some((b) => b.id === book.id);
  if (isAlreadyInCart) {
    onDuplicate();
    return;
  }

  const success = onAddedSuccess();
  if (!success) {
    return;
  }

  const prevCount = cartBooks.length;
  const nextCount = prevCount + 1;
  const prevPages = cartBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const nextPages = prevPages + (book.pages ?? 0);
  const updatedCart = [...cartBooks, book];

  // Milestone 1: Cart crossed 1000 pages or 2000 pages
  if (
    (prevPages < 1000 && nextPages >= 1000) ||
    (prevPages < 2000 && nextPages >= 2000)
  ) {
    try {
      const russianCount = updatedCart.filter(isRussianAuthor).length;
      const roast = await generateRoastFn({
        data: {
          cartCount: nextCount,
          event: "cart_milestone_pages",
          locale,
          russianCount,
          totalPages: nextPages,
        },
      });
      showRoastToast(roast);
      return;
    } catch {
      // Fallback is handled inside generateRoastFn
    }
  }

  // Milestone 2: Cart crossed 3 items or 6 items
  if ((prevCount < 3 && nextCount >= 3) || (prevCount < 6 && nextCount >= 6)) {
    try {
      const roast = await generateRoastFn({
        data: {
          bookTitle: book.title[locale],
          cartCount: nextCount,
          event: "cart_milestone_count",
          locale,
          totalPages: nextPages,
        },
      });
      showRoastToast(roast);
    } catch {
      // Fallback is handled inside generateRoastFn
    }
  }
}

export async function handleToggleWishWithMilestones({
  book,
  wishlistBooks,
  locale,
}: {
  book: Book;
  wishlistBooks: Book[];
  locale: Locale;
}) {
  const isAlreadyInWishlist = wishlistBooks.some((b) => b.id === book.id);
  if (isAlreadyInWishlist) {
    return;
  }

  const prevPages = wishlistBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const nextPages = prevPages + (book.pages ?? 0);
  const nextCount = wishlistBooks.length + 1;

  if (
    (prevPages < 1000 && nextPages >= 1000) ||
    (prevPages < 2000 && nextPages >= 2000)
  ) {
    try {
      const roast = await generateRoastFn({
        data: {
          bookTitle: book.title[locale],
          event: "wishlist_milestone_pages",
          locale,
          totalPages: nextPages,
          wishlistCount: nextCount,
        },
      });
      showRoastToast(roast);
    } catch {
      // Fallback is handled inside generateRoastFn
    }
  }
}

export async function triggerExplorationRoast({
  filterPreviousValue,
  filterType,
  filterValue,
  locale,
  searchCount,
}: {
  filterPreviousValue?: string | null;
  filterType: "query" | "genre" | "price" | "author" | "length";
  filterValue?: string | null;
  locale: Locale;
  searchCount: number;
}) {
  try {
    const isGenre = filterType === "genre";
    const roast = await generateRoastFn({
      data: {
        categorySwitches: isGenre ? searchCount : undefined,
        event: isGenre ? "category_switch_milestone" : "search_milestone",
        filterPreviousValue,
        filterType,
        filterValue,
        genreFrom: isGenre ? filterPreviousValue : undefined,
        genreTo: isGenre ? filterValue : undefined,
        locale,
        query: filterType === "query" ? (filterValue ?? undefined) : undefined,
        searchCount,
      },
    });
    showRoastToast(roast);
  } catch {
    // Handled inside generateRoastFn
  }
}

export async function triggerCategorySwitchRoast({
  categorySwitches,
  genreFrom,
  genreTo,
  locale,
}: {
  categorySwitches: number;
  genreFrom?: string | null;
  genreTo?: string | null;
  locale: Locale;
}) {
  await triggerExplorationRoast({
    filterPreviousValue: genreFrom,
    filterType: "genre",
    filterValue: genreTo,
    locale,
    searchCount: categorySwitches,
  });
}

export async function triggerSearchRoast({
  query,
  searchCount,
  locale,
}: {
  query: string;
  searchCount: number;
  locale: Locale;
}) {
  await triggerExplorationRoast({
    filterType: "query",
    filterValue: query,
    locale,
    searchCount,
  });
}
