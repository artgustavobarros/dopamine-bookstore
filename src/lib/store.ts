import { z } from "zod";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { type Book, booksById, type Locale } from "./catalog";

const profileSchema = z.object({ email: z.email(), name: z.string().min(1) });
const reviewSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  name: z.string(),
  stars: z.number().int().min(1).max(5),
  text: z.string(),
});
const itemSchema = z.object({
  author: z.object({ en: z.string(), pt: z.string() }),
  genre: z.string(),
  id: z.string(),
  pages: z.number().int().positive(),
  price: z.number().nonnegative(),
  title: z.object({ en: z.string(), pt: z.string() }),
});
const methodSchema = z.enum(["pix", "card", "none"]);
const orderSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  items: z.array(itemSchema),
  method: methodSchema,
  totalPages: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});
const savedSchema = z.object({
  cartIds: z.array(z.string()),
  locale: z.enum(["pt", "en"]),
  orders: z.array(orderSchema),
  profile: profileSchema.nullable(),
  reviews: z.record(z.string(), z.array(reviewSchema)),
  theme: z.enum(["light", "dark"]),
  wishlistIds: z.array(z.string()),
});

export type Profile = z.infer<typeof profileSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Order = z.infer<typeof orderSchema>;
export type PaymentMethod = z.infer<typeof methodSchema>;
export type Theme = "light" | "dark";

type AppState = z.infer<typeof savedSchema> & {
  hydrated: boolean;
  addCart: (id: string) => boolean;
  removeCart: (id: string) => void;
  toggleWish: (id: string) => boolean;
  moveWishesToCart: () => void;
  setProfile: (profile: Profile | null) => void;
  addReview: (bookId: string, stars: number, text: string) => void;
  completeOrder: (method: PaymentMethod) => string | null;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

const memory = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
};

const initial = {
  cartIds: [] as string[],
  hydrated: false,
  locale: "pt" as Locale,
  orders: [] as Order[],
  profile: null as Profile | null,
  reviews: {} as Record<string, Review[]>,
  theme: "light" as Theme,
  wishlistIds: [] as string[],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      addCart(id) {
        if (!booksById.has(id) || get().cartIds.includes(id)) {
          return false;
        }
        set((state) => ({ cartIds: [...state.cartIds, id] }));
        return true;
      },
      addReview(bookId, stars, text) {
        const { profile } = get();
        if (!(profile && booksById.has(bookId))) {
          return;
        }
        const review: Review = {
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
          name: profile.name,
          stars,
          text: text.trim(),
        };
        set((state) => ({
          reviews: {
            ...state.reviews,
            [bookId]: [review, ...(state.reviews[bookId] ?? [])],
          },
        }));
      },
      completeOrder(method) {
        const { cartIds, profile } = get();
        if (!profile || cartIds.length === 0) {
          return null;
        }
        const items = cartIds
          .map((id) => booksById.get(id))
          .filter((book): book is Book => Boolean(book))
          .map(({ id, title, author, genre, pages, price }) => ({
            author,
            genre,
            id,
            pages,
            price,
            title,
          }));
        if (items.length === 0) {
          return null;
        }
        const order: Order = {
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
          items,
          method,
          totalPages: items.reduce((sum, book) => sum + book.pages, 0),
          totalPrice: items.reduce((sum, book) => sum + book.price, 0),
        };
        set((state) => ({ cartIds: [], orders: [...state.orders, order] }));
        return order.id;
      },
      moveWishesToCart() {
        set((state) => ({
          cartIds: [...new Set([...state.cartIds, ...state.wishlistIds])],
          wishlistIds: [],
        }));
      },
      removeCart(id) {
        set((state) => ({
          cartIds: state.cartIds.filter((entry) => entry !== id),
        }));
      },
      setLocale(locale) {
        set({ locale });
      },
      setProfile(profile) {
        set({ profile });
      },
      setTheme(theme) {
        set({ theme });
      },
      toggleWish(id) {
        if (!booksById.has(id)) {
          return false;
        }
        const adding = !get().wishlistIds.includes(id);
        set((state) => ({
          wishlistIds: adding
            ? [...state.wishlistIds, id]
            : state.wishlistIds.filter((entry) => entry !== id),
        }));
        return adding;
      },
    }),
    {
      merge: (persisted, current) => {
        const parsed = savedSchema.safeParse(persisted);
        if (!parsed.success) {
          return current;
        }
        return {
          ...current,
          ...parsed.data,
          cartIds: [
            ...new Set(parsed.data.cartIds.filter((id) => booksById.has(id))),
          ],
          reviews: Object.fromEntries(
            Object.entries(parsed.data.reviews).filter(([id]) =>
              booksById.has(id)
            )
          ),
          wishlistIds: [
            ...new Set(
              parsed.data.wishlistIds.filter((id) => booksById.has(id))
            ),
          ],
        };
      },
      name: "depois-eu-leio-v1",
      partialize: (state) => ({
        cartIds: state.cartIds,
        locale: state.locale,
        orders: state.orders,
        profile: state.profile,
        reviews: state.reviews,
        theme: state.theme,
        wishlistIds: state.wishlistIds,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      version: 1,
    }
  )
);

export function getCartBooks(ids: string[]): Book[] {
  return ids
    .map((id) => booksById.get(id))
    .filter((book): book is Book => Boolean(book));
}

export function getCartTotals(ids: string[]) {
  const selected = getCartBooks(ids);
  return {
    pages: selected.reduce((sum, book) => sum + book.pages, 0),
    savings: selected.reduce(
      (sum, book) =>
        sum + Math.max(0, (book.oldPrice ?? book.price) - book.price),
      0
    ),
    subtotal: selected.reduce((sum, book) => sum + book.price, 0),
  };
}
