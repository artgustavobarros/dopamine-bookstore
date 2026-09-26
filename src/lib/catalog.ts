import { z } from "zod";

export const genres = [
  "Clássicos",
  "Filosofia",
  "Produtividade",
  "Ficção científica",
  "Aventura",
  "Outros",
] as const;
export type Genre = (typeof genres)[number];
export type Locale = "pt" | "en";

const localizedSchema = z.object({ en: z.string(), pt: z.string() });
export const bookSchema = z.object({
  author: localizedSchema,
  coverId: z.number().int().positive().nullable(),
  description: localizedSchema,
  genre: z.enum(genres),
  id: z.string().regex(/^OL\d+W$/),
  oldPrice: z.number().positive().optional(),
  pages: z.number().int().positive().nullable(),
  price: z.number().nonnegative(),
  sourceLocale: z.enum(["pt", "en"]),
  title: localizedSchema,
  year: z.number().int().nullable(),
});
export type Book = z.infer<typeof bookSchema>;

export const genreLabels: Record<Genre, Record<Locale, string>> = {
  Aventura: { en: "Adventure", pt: "Aventura" },
  Clássicos: { en: "Classics", pt: "Clássicos" },
  "Ficção científica": { en: "Science fiction", pt: "Ficção científica" },
  Filosofia: { en: "Philosophy", pt: "Filosofia" },
  Outros: { en: "Other", pt: "Outros" },
  Produtividade: { en: "Productivity", pt: "Produtividade" },
};
export const genreColors: Record<Genre, string> = {
  Aventura: "bg-pink",
  Clássicos: "bg-red",
  "Ficção científica": "bg-green",
  Filosofia: "bg-yellow",
  Outros: "bg-blue",
  Produtividade: "bg-blue",
};

export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US").format(
    value
  );
}

export function readingHours(pages: number): number {
  return Math.max(1, Math.round(pages / 40));
}

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface CatalogFilters {
  author: string;
  genre: Genre | "all";
  length: "all" | "short" | "medium" | "long";
  price: "all" | "under50" | "under100" | "over100";
  query: string;
}

function matchesPrice(book: Book, price: CatalogFilters["price"]): boolean {
  if (price === "under50") {
    return book.price <= 50;
  }
  if (price === "under100") {
    return book.price <= 100;
  }
  if (price === "over100") {
    return book.price > 100;
  }
  return true;
}

function matchesLength(book: Book, length: CatalogFilters["length"]): boolean {
  if (length === "all") {
    return true;
  }
  if (book.pages === null) {
    return false;
  }
  if (length === "short") {
    return book.pages <= 250;
  }
  if (length === "medium") {
    return book.pages > 250 && book.pages < 600;
  }
  return book.pages >= 600;
}

export function filterBooks(books: Book[], filters: CatalogFilters): Book[] {
  return books.filter(
    (book) =>
      (filters.genre === "all" || book.genre === filters.genre) &&
      (filters.author === "all" || book.author.pt === filters.author) &&
      matchesPrice(book, filters.price) &&
      matchesLength(book, filters.length)
  );
}

export function catalogAuthors(books: Book[]): string[] {
  return [...new Set(books.map((book) => book.author.pt))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}
