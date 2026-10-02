import type { Book, Locale } from "./catalog";
import { showRoastToast } from "./roast-toast";
import {
  type EvaluatedRoast,
  type IntensityLevel,
  type RoastContext,
  type RoastEvent,
  selectRoastFromCatalog,
} from "./roasts";
import { generateRoastFn } from "./server/roast";

let burstTimer: NodeJS.Timeout | null = null;
let burstQueue: Array<{
  actionCallback?: () => void;
  ctx: RoastContext;
  event: RoastEvent;
  level: IntensityLevel;
  locale: Locale;
}> = [];

export function clearBurstQueue() {
  if (burstTimer) {
    clearTimeout(burstTimer);
    burstTimer = null;
  }
  burstQueue = [];
}

async function executeSingleRoast(
  event: RoastEvent,
  ctx: RoastContext,
  level: IntensityLevel,
  locale: Locale,
  actionCallback?: () => void
) {
  // Check client-side cooldown & catalog selection first
  const catalogCandidate = selectRoastFromCatalog(event, ctx, level, locale);
  if (!catalogCandidate) {
    // Suppressed by cooldown (P2 4s, P3 10s)
    return;
  }

  try {
    const roast = await generateRoastFn({
      data: {
        ...ctx,
        event,
        level,
        locale,
        owned:
          ctx.owned instanceof Set
            ? Array.from(ctx.owned).slice(0, 100)
            : ctx.owned,
      },
    });

    if ("msg" in roast) {
      showRoastToast(roast as EvaluatedRoast, actionCallback);
    } else {
      showRoastToast(catalogCandidate, actionCallback);
    }
  } catch {
    // Immediate deterministic catalog fallback
    showRoastToast(catalogCandidate, actionCallback);
  }
}

export function triggerRoast(
  event: RoastEvent,
  ctx: RoastContext,
  locale: Locale = "pt",
  level: IntensityLevel = "normal",
  actionCallback?: () => void
) {
  // Aggregate rapid bursts within 600ms for cart actions
  if (event === "book-added" || event === "cart-removed") {
    burstQueue.push({ actionCallback, ctx, event, level, locale });

    if (burstTimer) {
      clearTimeout(burstTimer);
    }

    burstTimer = setTimeout(() => {
      const currentQueue = [...burstQueue];
      burstQueue = [];
      burstTimer = null;

      if (currentQueue.length > 1) {
        // Consolidated burst roast
        const count = currentQueue.length;
        const isPt = locale === "pt";
        const burstRoast: EvaluatedRoast = {
          event: "book-added",
          isBurst: true,
          msg: isPt
            ? `${count} livros de uma vez. Ambicioso.`
            : `${count} books in one go. Ambitious.`,
          priority: 2,
          ruleId: "burst-aggregated",
          sfx: isPt ? "AMBICIOSO!" : "AMBITIOUS!",
          variantIndex: 0,
        };
        showRoastToast(burstRoast, actionCallback);
      } else if (currentQueue.length === 1) {
        const item = currentQueue[0];
        executeSingleRoast(
          item.event,
          item.ctx,
          item.level,
          item.locale,
          item.actionCallback
        );
      }
    }, 600);

    return;
  }

  // Non-burst event: execute immediately
  executeSingleRoast(event, ctx, level, locale, actionCallback);
}

// -------------------------------------------------------------
// CONVENIENCE DISPATCHERS FOR STORE ACTIONS
// -------------------------------------------------------------

export function dispatchBookAdded({
  book,
  cartBooks,
  orders = [],
  locale,
  onNavigateToCart,
}: {
  book: Book;
  cartBooks: Book[];
  locale: Locale;
  onNavigateToCart?: () => void;
  orders?: any[];
}) {
  const isAlreadyPurchased = orders.some((order) =>
    order.books?.includes?.(book.id)
  );

  const cartPages = cartBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const russianCount = cartBooks.filter(
    (b) =>
      b.genre === "Clássicos" &&
      (b.author[locale].toLowerCase().includes("dostoi") ||
        b.author[locale].toLowerCase().includes("tolst") ||
        b.author[locale].toLowerCase().includes("tchékhov") ||
        b.author[locale].toLowerCase().includes("gogol"))
  ).length;

  const ctx: RoastContext = {
    author: book.author[locale],
    book: {
      author: book.author[locale],
      genre: book.genre,
      id: book.id,
      pages: book.pages ?? 0,
      price: book.price,
      title: book.title[locale],
    },
    cart: cartBooks.map((b) => ({
      author: b.author[locale],
      genre: b.genre,
      id: b.id,
      pages: b.pages ?? 0,
      price: b.price,
      title: b.title[locale],
    })),
    hours: Math.ceil((book.pages ?? 100) / 40),
    pages: book.pages ?? 0,
    ru: russianCount,
    title: book.title[locale],
    totalPages: cartPages + (book.pages ?? 0),
  };

  if (isAlreadyPurchased) {
    triggerRoast("book-readded", ctx, locale, "normal", onNavigateToCart);
  } else {
    triggerRoast("book-added", ctx, locale, "normal", onNavigateToCart);
  }
}

export function dispatchBookRemoved({
  book,
  remainingCart,
  locale,
  onUndo,
}: {
  book: Book;
  locale: Locale;
  onUndo?: () => void;
  remainingCart: Book[];
}) {
  const remainingPages = remainingCart.reduce(
    (sum, b) => sum + (b.pages ?? 0),
    0
  );
  const ctx: RoastContext = {
    author: book.author[locale],
    book: {
      author: book.author[locale],
      genre: book.genre,
      id: book.id,
      pages: book.pages ?? 0,
      price: book.price,
      title: book.title[locale],
    },
    cart: remainingCart.map((b) => ({
      author: b.author[locale],
      genre: b.genre,
      id: b.id,
      pages: b.pages ?? 0,
      price: b.price,
      title: b.title[locale],
    })),
    pages: remainingPages,
    savedPages: book.pages ?? 0,
    title: book.title[locale],
  };

  triggerRoast("cart-removed", ctx, locale, "normal", onUndo);
}

export function dispatchCartOpened({
  cartBooks,
  total,
  locale,
  onCheckout,
}: {
  cartBooks: Book[];
  locale: Locale;
  onCheckout?: () => void;
  total: number;
}) {
  const totalPages = cartBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const ctx: RoastContext = {
    cart: cartBooks.map((b) => ({
      author: b.author[locale],
      genre: b.genre,
      id: b.id,
      pages: b.pages ?? 0,
      price: b.price,
      title: b.title[locale],
    })),
    n: cartBooks.length,
    pages: totalPages,
    total,
  };

  triggerRoast("cart-opened", ctx, locale, "normal", onCheckout);
}

export function dispatchCheckoutStarted({
  cartBooks,
  total,
  locale,
}: {
  cartBooks: Book[];
  locale: Locale;
  total: number;
}) {
  const totalPages = cartBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const ctx: RoastContext = {
    n: cartBooks.length,
    pages: totalPages,
    total,
  };

  triggerRoast("checkout-started", ctx, locale, "normal");
}

export function dispatchLoginRequired(locale: Locale) {
  triggerRoast("login-required", {}, locale, "normal");
}

export function dispatchLogin({
  name,
  locale,
}: {
  locale: Locale;
  name: string;
}) {
  triggerRoast("login", { name }, locale, "normal");
}

export function dispatchWishAdded({
  book,
  inCart,
  wishCount,
  locale,
}: {
  book: Book;
  inCart: boolean;
  locale: Locale;
  wishCount: number;
}) {
  const ctx: RoastContext = {
    author: book.author[locale],
    inCart,
    title: book.title[locale],
    wish: wishCount,
  };

  triggerRoast("wish-added", ctx, locale, "normal");
}

export function dispatchReviewPosted({
  owned,
  locale,
}: {
  locale: Locale;
  owned: boolean;
}) {
  triggerRoast("review-posted", { owned }, locale, "normal");
}

export function dispatchPixCopied(locale: Locale) {
  triggerRoast("pix-copied", {}, locale, "normal");
}

export function dispatchPixExpired(locale: Locale, onRetry?: () => void) {
  triggerRoast("pix-expired", {}, locale, "normal", onRetry);
}

export function dispatchCardDeclined({
  cardBrand,
  cardLast4,
  locale,
  onRetry,
}: {
  cardBrand: string;
  cardLast4: string;
  locale: Locale;
  onRetry?: () => void;
}) {
  triggerRoast(
    "card-declined",
    { cardBrand, cardLast4 },
    locale,
    "normal",
    onRetry
  );
}

export function dispatchPurchaseCompleted({
  ordersCount,
  total,
  pages,
  locale,
}: {
  locale: Locale;
  ordersCount: number;
  pages: number;
  total: number;
}) {
  const ctx: RoastContext = {
    n: ordersCount,
    orders: Array.from({ length: Math.min(ordersCount, 100) }, () => ({
      books: [],
    })),
    pages,
    total,
  };

  triggerRoast("purchase-completed", ctx, locale, "normal");
}

export function dispatchDeliveryStage({
  stage,
  orderId,
  eta,
  locale,
}: {
  eta: string;
  locale: Locale;
  orderId: string;
  stage: string;
}) {
  const ctx: RoastContext = {
    deliveryCode: orderId,
    deliveryStage: stage,
    eta,
  };

  triggerRoast("delivery-stage", ctx, locale, "normal");
}

export function dispatchDelivered({
  pages,
  locale,
}: {
  locale: Locale;
  pages: number;
}) {
  triggerRoast("delivered", { pages }, locale, "normal");
}

export function dispatchDeliveryReceiptConfirmed({
  locale,
  orderId,
  pages,
}: {
  locale: Locale;
  orderId: string;
  pages?: number;
}) {
  triggerRoast(
    "delivery-receipt-confirmed",
    { deliveryCode: orderId, pages },
    locale,
    "normal"
  );
}

export function dispatchIdle({
  bookTitle,
  locale,
  onBrowse,
}: {
  bookTitle?: string;
  locale: Locale;
  onBrowse?: () => void;
}) {
  triggerRoast(
    "idle",
    { title: bookTitle ?? (locale === "pt" ? "este livro" : "this book") },
    locale,
    "normal",
    onBrowse
  );
}

// Backwards compatibility for existing milestone calls
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

  dispatchBookAdded({
    book,
    cartBooks: [...cartBooks, book],
    locale,
  });
}

export async function handleToggleWishWithMilestones({
  book,
  wishlistBooks,
  locale,
  inCart = false,
}: {
  book: Book;
  locale: Locale;
  wishlistBooks: Book[];
  inCart?: boolean;
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
      return;
    } catch {
      // Fallback is handled inside generateRoastFn
    }
  }

  dispatchWishAdded({
    book,
    inCart,
    locale,
    wishCount: nextCount,
  });
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
  const isGenre = filterType === "genre";
  const event = isGenre ? "category_switch_milestone" : "search_milestone";
  try {
    const roast = await generateRoastFn({
      data: {
        categorySwitches: isGenre ? searchCount : undefined,
        event,
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
    // ignore
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
