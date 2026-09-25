import { z } from "zod";
import rawBooks from "../data/books.json";

export const genres = [
  "Clássicos",
  "Filosofia",
  "Produtividade",
  "Ficção científica",
  "Aventura",
] as const;

const localizedSchema = z.object({
  en: z.string().min(1),
  pt: z.string().min(1),
});
const bookSchema = z.object({
  author: localizedSchema,
  description: localizedSchema,
  genre: z.enum(genres),
  id: z.string().min(1),
  oldPrice: z.number().positive().optional(),
  pages: z.number().int().positive(),
  price: z.number().nonnegative(),
  title: localizedSchema,
  year: z.number().int(),
});

export type Book = z.infer<typeof bookSchema>;
export type Genre = Book["genre"];
export type Locale = "pt" | "en";

export const books: Book[] = z.array(bookSchema).parse(rawBooks);
export const booksById = new Map(books.map((book) => [book.id, book]));

if (booksById.size !== books.length) {
  throw new Error("Catalog contains duplicate book IDs");
}

export const genreLabels: Record<Genre, Record<Locale, string>> = {
  Aventura: { en: "Adventure", pt: "Aventura" },
  Clássicos: { en: "Classics", pt: "Clássicos" },
  "Ficção científica": { en: "Science fiction", pt: "Ficção científica" },
  Filosofia: { en: "Philosophy", pt: "Filosofia" },
  Produtividade: { en: "Productivity", pt: "Produtividade" },
};

export const genreColors: Record<Genre, string> = {
  Aventura: "bg-pink",
  Clássicos: "bg-red",
  "Ficção científica": "bg-green",
  Filosofia: "bg-yellow",
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
  if (length === "short") {
    return book.pages <= 250;
  }
  if (length === "medium") {
    return book.pages > 250 && book.pages < 600;
  }
  if (length === "long") {
    return book.pages >= 600;
  }
  return true;
}

export function filterBooks(filters: CatalogFilters): Book[] {
  const query = normalize(filters.query);
  return books.filter((book) => {
    const searchable = normalize(
      `${book.title.pt} ${book.title.en} ${book.author.pt} ${book.author.en}`
    );
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesGenre =
      filters.genre === "all" || book.genre === filters.genre;
    const matchesAuthor =
      filters.author === "all" || book.author.pt === filters.author;
    return (
      matchesQuery &&
      matchesGenre &&
      matchesAuthor &&
      matchesPrice(book, filters.price) &&
      matchesLength(book, filters.length)
    );
  });
}

export const authors = [...new Set(books.map((book) => book.author.pt))].sort(
  (a, b) => a.localeCompare(b, "pt-BR")
);
