import { z } from "zod";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { type Book, bookSchema, type Locale } from "./catalog";

const bookIdPattern = /^OL\d+W$/;

export const addressSchema = z.object({
  cep: z.string(),
  city: z.string(),
  comp: z.string().optional(),
  id: z.string(),
  label: z.string(),
  number: z.string(),
  street: z.string(),
  uf: z.string(),
});
export type Address = z.infer<typeof addressSchema>;

export const savedCardSchema = z.object({
  brand: z.string(),
  exp: z.string(),
  id: z.string(),
  last4: z.string(),
  name: z.string(),
});
export type SavedCard = z.infer<typeof savedCardSchema>;

const profileSchema = z.object({
  addresses: z.array(addressSchema).default([]),
  cards: z.array(savedCardSchema).default([]),
  email: z.string().email(),
  name: z.string().min(1),
  prefAddr: z.string().nullable().default(null),
  prefPay: z.string().default("pix"),
});

const registeredUserSchema = z.object({
  addresses: z.array(addressSchema).default([]),
  cards: z.array(savedCardSchema).default([]),
  createdAt: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().optional(),
  prefAddr: z.string().nullable().default(null),
  prefPay: z.string().default("pix"),
});

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
  pages: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  title: z.object({ en: z.string(), pt: z.string() }),
});

const orderSchema = z.object({
  address: addressSchema.optional(),
  createdAt: z.string(),
  id: z.string(),
  items: z.array(itemSchema),
  method: z.string(),
  totalPages: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

const savedSchema = z.object({
  bookCache: z.record(z.string(), bookSchema),
  cartIds: z.array(z.string()),
  locale: z.enum(["pt", "en"]),
  orders: z.array(orderSchema),
  profile: profileSchema.nullable(),
  reviews: z.record(z.string(), z.array(reviewSchema)),
  theme: z.enum(["light", "dark"]),
  users: z.record(z.string(), registeredUserSchema).default({}),
  wishlistIds: z.array(z.string()),
});

export type Profile = z.infer<typeof profileSchema>;
export type RegisteredUser = z.infer<typeof registeredUserSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Theme = "light" | "dark";

type AppState = z.infer<typeof savedSchema> & {
  hydrated: boolean;
  addCart: (book: Book) => boolean;
  removeCart: (id: string) => void;
  toggleWish: (book: Book) => boolean;
  moveWishesToCart: () => void;
  setProfile: (profile: Profile | null) => void;
  registerUser: (data: { name: string; email: string; password?: string }) => {
    success: boolean;
    error?: "email_taken" | "invalid_data";
  };
  signInUser: (data: { email: string; password?: string }) => {
    success: boolean;
    error?: "not_found" | "invalid_password";
  };
  updateProfile: (data: { name: string; email: string; password?: string }) => {
    success: boolean;
    error?: string;
  };
  addAddress: (address: Omit<Address, "id">) => Address | null;
  removeAddress: (id: string) => void;
  setPreferredAddress: (id: string) => void;
  addCard: (card: Omit<SavedCard, "id">) => SavedCard | null;
  removeCard: (id: string) => void;
  setPreferredPayment: (prefPay: string) => void;
  addReview: (bookId: string, stars: number, text: string) => void;
  completeOrder: (method: string, address?: Address) => string | null;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  refreshBooks: (books: Book[]) => void;
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
  bookCache: {} as Record<string, Book>,
  cartIds: [] as string[],
  hydrated: false,
  locale: "pt" as Locale,
  orders: [] as Order[],
  profile: null as Profile | null,
  reviews: {} as Record<string, Review[]>,
  theme: "light" as Theme,
  users: {} as Record<string, RegisteredUser>,
  wishlistIds: [] as string[],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      addAddress(data) {
        const { profile, users } = get();
        if (!profile) {
          return null;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return null;
        }

        const newAddress: Address = {
          ...data,
          id: crypto.randomUUID(),
        };

        const nextAddresses = [...(user.addresses || []), newAddress];
        const nextPref = user.prefAddr || newAddress.id;

        const updatedUser: RegisteredUser = {
          ...user,
          addresses: nextAddresses,
          prefAddr: nextPref,
        };

        const updatedProfile: Profile = {
          ...profile,
          addresses: nextAddresses,
          prefAddr: nextPref,
        };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
        }));

        return newAddress;
      },
      addCard(data) {
        const { profile, users } = get();
        if (!profile) {
          return null;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return null;
        }

        const newCard: SavedCard = {
          ...data,
          id: crypto.randomUUID(),
        };

        const nextCards = [...(user.cards || []), newCard];

        const updatedUser: RegisteredUser = {
          ...user,
          cards: nextCards,
        };

        const updatedProfile: Profile = {
          ...profile,
          cards: nextCards,
        };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
        }));

        return newCard;
      },
      addCart(book) {
        if (
          !bookSchema.safeParse(book).success ||
          get().cartIds.includes(book.id)
        ) {
          return false;
        }
        set((state) => ({
          bookCache: { ...state.bookCache, [book.id]: book },
          cartIds: [...state.cartIds, book.id],
        }));
        return true;
      },
      addReview(bookId, stars, text) {
        const { profile, users } = get();
        if (
          !(
            profile &&
            users[profile.email.toLowerCase()] &&
            bookIdPattern.test(bookId)
          )
        ) {
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
      completeOrder(method, address) {
        const { cartIds, profile, users } = get();
        if (
          !(profile && users[profile.email.toLowerCase()]) ||
          cartIds.length === 0
        ) {
          return null;
        }
        const items = cartIds
          .map((id) => get().bookCache[id])
          .filter((book): book is Book => Boolean(book))
          .map(({ id, title, author, genre, pages, price }) => ({
            author,
            genre,
            id,
            pages: pages ?? 0,
            price,
            title,
          }));
        if (items.length === 0) {
          return null;
        }
        const order: Order = {
          address,
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
      refreshBooks(books) {
        set((state) => {
          const next = { ...state.bookCache };
          let changed = false;
          for (const book of books) {
            if (
              next[book.id] &&
              JSON.stringify(next[book.id]) !== JSON.stringify(book)
            ) {
              next[book.id] = book;
              changed = true;
            }
          }
          return changed ? { bookCache: next } : state;
        });
      },
      registerUser(data) {
        const email = data.email.trim().toLowerCase();
        const name = data.name.trim();
        if (!(email && name)) {
          return { error: "invalid_data", success: false };
        }
        const { users } = get();
        if (users[email]) {
          return { error: "email_taken", success: false };
        }
        const user: RegisteredUser = {
          addresses: [],
          cards: [],
          createdAt: new Date().toISOString(),
          email,
          name,
          password: data.password?.trim() || undefined,
          prefAddr: null,
          prefPay: "pix",
        };
        const profile: Profile = {
          addresses: [],
          cards: [],
          email,
          name,
          prefAddr: null,
          prefPay: "pix",
        };
        set((state) => ({
          profile,
          users: { ...state.users, [email]: user },
        }));
        return { success: true };
      },
      removeAddress(id) {
        const { profile, users } = get();
        if (!profile) {
          return;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return;
        }

        const nextAddresses = (user.addresses || []).filter((a) => a.id !== id);
        const nextPref =
          user.prefAddr === id ? nextAddresses[0]?.id || null : user.prefAddr;

        const updatedUser: RegisteredUser = {
          ...user,
          addresses: nextAddresses,
          prefAddr: nextPref,
        };

        const updatedProfile: Profile = {
          ...profile,
          addresses: nextAddresses,
          prefAddr: nextPref,
        };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
        }));
      },
      removeCard(id) {
        const { profile, users } = get();
        if (!profile) {
          return;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return;
        }

        const nextCards = (user.cards || []).filter((c) => c.id !== id);
        const nextPrefPay =
          user.prefPay === `saved:${id}` ? "pix" : user.prefPay;

        const updatedUser: RegisteredUser = {
          ...user,
          cards: nextCards,
          prefPay: nextPrefPay,
        };

        const updatedProfile: Profile = {
          ...profile,
          cards: nextCards,
          prefPay: nextPrefPay,
        };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
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
      setPreferredAddress(id) {
        const { profile, users } = get();
        if (!profile) {
          return;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return;
        }

        const updatedUser: RegisteredUser = { ...user, prefAddr: id };
        const updatedProfile: Profile = { ...profile, prefAddr: id };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
        }));
      },
      setPreferredPayment(prefPay) {
        const { profile, users } = get();
        if (!profile) {
          return;
        }
        const email = profile.email.toLowerCase();
        const user = users[email];
        if (!user) {
          return;
        }

        const updatedUser: RegisteredUser = { ...user, prefPay };
        const updatedProfile: Profile = { ...profile, prefPay };

        set((state) => ({
          profile: updatedProfile,
          users: { ...state.users, [email]: updatedUser },
        }));
      },
      setProfile(profile) {
        if (profile) {
          const email = profile.email.trim().toLowerCase();
          const { users } = get();
          const existing = users[email];
          if (!existing) {
            return;
          }
          set({
            profile: {
              addresses: existing.addresses || [],
              cards: existing.cards || [],
              email: existing.email,
              name: existing.name,
              prefAddr: existing.prefAddr || null,
              prefPay: existing.prefPay || "pix",
            },
          });
        } else {
          set({ profile: null });
        }
      },
      setTheme(theme) {
        set({ theme });
      },
      signInUser(data) {
        const email = data.email.trim().toLowerCase();
        const { users } = get();
        const existing = users[email];
        if (existing) {
          if (
            existing.password &&
            (!data.password || existing.password !== data.password.trim())
          ) {
            return { error: "invalid_password", success: false };
          }
          set({
            profile: {
              addresses: existing.addresses || [],
              cards: existing.cards || [],
              email: existing.email,
              name: existing.name,
              prefAddr: existing.prefAddr || null,
              prefPay: existing.prefPay || "pix",
            },
          });
          return { success: true };
        }
        return { error: "not_found", success: false };
      },
      toggleWish(book) {
        if (!bookSchema.safeParse(book).success) {
          return false;
        }
        const adding = !get().wishlistIds.includes(book.id);
        set((state) => ({
          bookCache: { ...state.bookCache, [book.id]: book },
          wishlistIds: adding
            ? [...state.wishlistIds, book.id]
            : state.wishlistIds.filter((entry) => entry !== book.id),
        }));
        return adding;
      },
      updateProfile(data) {
        const { profile, users } = get();
        if (!profile) {
          return { error: "not_authenticated", success: false };
        }
        const oldEmail = profile.email.toLowerCase();
        const newEmail = data.email.trim().toLowerCase();
        const newName = data.name.trim();

        if (!(newName && newEmail)) {
          return { error: "invalid_data", success: false };
        }

        const existingUser = users[oldEmail];
        if (!existingUser) {
          return { error: "not_found", success: false };
        }

        if (newEmail !== oldEmail && users[newEmail]) {
          return { error: "email_taken", success: false };
        }

        const updatedUser: RegisteredUser = {
          ...existingUser,
          email: newEmail,
          name: newName,
          password: data.password
            ? data.password.trim()
            : existingUser.password,
        };

        const updatedProfile: Profile = {
          ...profile,
          email: newEmail,
          name: newName,
        };

        const nextUsers = { ...users };
        if (newEmail !== oldEmail) {
          delete nextUsers[oldEmail];
        }
        nextUsers[newEmail] = updatedUser;

        set(() => ({
          profile: updatedProfile,
          users: nextUsers,
        }));

        return { success: true };
      },
    }),
    {
      merge: (persisted, current) => {
        const parsed = savedSchema.safeParse(persisted);
        if (!parsed.success) {
          return current;
        }
        const users = parsed.data.users ?? {};
        const profile =
          parsed.data.profile && users[parsed.data.profile.email.toLowerCase()]
            ? parsed.data.profile
            : null;
        return {
          ...current,
          ...parsed.data,
          cartIds: [
            ...new Set(
              parsed.data.cartIds.filter((id) => parsed.data.bookCache[id])
            ),
          ],
          profile,
          reviews: Object.fromEntries(
            Object.entries(parsed.data.reviews).filter(([id]) =>
              bookIdPattern.test(id)
            )
          ),
          users,
          wishlistIds: [
            ...new Set(
              parsed.data.wishlistIds.filter((id) => parsed.data.bookCache[id])
            ),
          ],
        };
      },
      migrate: (persisted) => {
        const legacy = savedSchema
          .omit({ bookCache: true })
          .safeParse(persisted);
        if (!legacy.success) {
          return initial;
        }
        return {
          ...legacy.data,
          bookCache: {},
          cartIds: [],
          users: {},
          wishlistIds: [],
        };
      },
      name: "depois-eu-leio-v1",
      partialize: (state) => ({
        bookCache: state.bookCache,
        cartIds: state.cartIds,
        locale: state.locale,
        orders: state.orders,
        profile: state.profile,
        reviews: state.reviews,
        theme: state.theme,
        users: state.users,
        wishlistIds: state.wishlistIds,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      version: 2,
    }
  )
);

export function getCartBooks(
  ids: string[],
  bookCache: Record<string, Book>
): Book[] {
  return ids
    .map((id) => bookCache[id])
    .filter((book): book is Book => Boolean(book));
}

export const getWishlistBooks = getCartBooks;

export function getCartTotals(ids: string[], bookCache: Record<string, Book>) {
  const selected = getCartBooks(ids, bookCache);
  return {
    pages: selected.reduce((sum, book) => sum + (book.pages ?? 0), 0),
    savings: selected.reduce(
      (sum, book) =>
        sum + Math.max(0, (book.oldPrice ?? book.price) - book.price),
      0
    ),
    subtotal: selected.reduce((sum, book) => sum + book.price, 0),
  };
}
