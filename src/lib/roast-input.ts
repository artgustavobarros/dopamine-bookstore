import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const count = z.number().int().finite().min(0).max(1_000_000);
const amount = z.number().finite().min(0).max(1_000_000_000);

const bookContext = z.object({
  author: text(160),
  genre: text(80),
  id: text(40),
  old: z.boolean().optional(),
  pages: count,
  price: amount.optional(),
  ru: z.boolean().optional(),
  title: text(200),
});

const cartItem = z.object({
  author: text(160).optional(),
  genre: text(80).optional(),
  id: text(40).optional(),
  old: z.boolean().optional(),
  pages: count.optional(),
  price: amount.optional(),
  ru: z.boolean().optional(),
  title: text(200).optional(),
});

const orderContext = z.object({
  books: z.array(text(40)).max(50),
  createdAt: text(40).optional(),
  id: text(80).optional(),
  totalPrice: amount.optional(),
});

export const roastInputSchema = z.object({
  author: text(160).optional(),
  authorCount: count.optional(),
  book: bookContext.optional(),
  bookTitle: text(200).optional(),
  burstCount: count.optional(),
  cardBrand: text(32).optional(),
  cardLast4: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  cart: z.array(cartItem).max(50).optional(),
  cartCount: count.optional(),
  categorySwitches: count.optional(),
  deliveryCode: text(80).optional(),
  deliveryStage: text(80).optional(),
  eta: text(80).optional(),
  event: z.enum([
    "book-added",
    "book-readded",
    "cart-opened",
    "checkout-started",
    "login-required",
    "login",
    "wish-added",
    "review-posted",
    "pix-copied",
    "pix-expired",
    "card-declined",
    "purchase-completed",
    "delivery-stage",
    "delivered",
    "delivery-receipt-confirmed",
    "idle",
    "cart-removed",
    "cart_milestone_count",
    "cart_milestone_pages",
    "checkout_opened",
    "order_completed",
    "diagnosis",
    "wishlist_milestone_pages",
    "category_switch_milestone",
    "search_milestone",
  ]),
  favoriteAuthor: text(160).nullable().optional(),
  favoriteGenre: text(80).nullable().optional(),
  filterPreviousValue: text(160).nullable().optional(),
  filterType: z
    .enum(["query", "genre", "price", "author", "length"])
    .nullable()
    .optional(),
  filterValue: text(160).nullable().optional(),
  genreFrom: text(80).nullable().optional(),
  genreTo: text(80).nullable().optional(),
  hours: z.union([amount, z.string().max(16)]).optional(),
  inCart: z.boolean().optional(),
  level: z.enum(["educado", "normal", "impiedoso"]).optional(),
  locale: z.enum(["pt", "en"]).default("pt"),
  n: count.optional(),
  name: text(80).optional(),
  orderCount: count.optional(),
  orderNumber: text(80).optional(),
  orders: z.array(orderContext).max(100).optional(),
  owned: z.union([z.boolean(), z.array(text(40)).max(100)]).optional(),
  pages: count.optional(),
  pay: text(80).optional(),
  paymentMethod: text(80).optional(),
  pretendSpend: amount.optional(),
  prevPages: count.optional(),
  promo: amount.optional(),
  query: text(80).optional(),
  ru: count.optional(),
  russianCount: count.optional(),
  savedPages: count.optional(),
  searchCount: count.optional(),
  small: z.boolean().optional(),
  title: text(200).optional(),
  total: amount.optional(),
  totalPages: count.optional(),
  wish: count.optional(),
  wishlistCount: count.optional(),
});

export type UnifiedRoastInput = z.infer<typeof roastInputSchema>;
