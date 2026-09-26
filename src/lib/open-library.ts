import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import {
  type Book,
  bookSchema,
  type Genre,
  type Locale,
  normalize,
} from "./catalog";

const api = axios.create({
  baseURL: "https://openlibrary.org",
  timeout: 12_000,
});
const editionSchema = z.object({
  cover_i: z.number().optional(),
  key: z.string(),
  language: z.array(z.string()).optional(),
  title: z.string().optional(),
});
const workSchema = z.object({
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().optional(),
  editions: z.object({ docs: z.array(editionSchema) }).optional(),
  first_publish_year: z.number().optional(),
  key: z.string(),
  number_of_pages_median: z.number().optional(),
  subject: z.array(z.string()).optional(),
  title: z.string().optional(),
});
const searchSchema = z.object({ docs: z.array(workSchema) });
type Work = z.infer<typeof workSchema>;

const fields = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "number_of_pages_median",
  "subject",
  "cover_i",
  "editions",
  "editions.key",
  "editions.title",
  "editions.language",
  "editions.cover_i",
].join(",");
const languageCode = { en: "eng", pt: "por" } as const;
const scienceFictionPattern = /science fiction|ficcao cientifica|sci-fi/;
const philosophyPattern = /philosoph|filosof/;
const productivityPattern =
  /self.help|personal growth|habit|productiv|desenvolvimento pessoal/;
const adventurePattern = /adventure|aventura|fantasy|fantasia/;
const classicsPattern = /classic|classico|literary fiction|literatura classica/;
const workKeyPattern = /^\/works\/(OL\d+W)$/;
const bookIdPattern = /^OL\d+W$/;
const unsafeSearchPattern = /[^\p{L}\p{N}\s]/gu;
let nextSearchAt = 0;

async function waitForSearchSlot(signal?: AbortSignal) {
  signal?.throwIfAborted();
  const now = Date.now();
  const delay = Math.max(0, nextSearchAt - now);
  nextSearchAt = Math.max(now, nextSearchAt) + 1100;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  signal?.throwIfAborted();
}

function genreFromSubjects(subjects: string[]): Genre {
  const text = normalize(subjects.join(" "));
  if (scienceFictionPattern.test(text)) {
    return "Ficção científica";
  }
  if (philosophyPattern.test(text)) {
    return "Filosofia";
  }
  if (productivityPattern.test(text)) {
    return "Produtividade";
  }
  if (adventurePattern.test(text)) {
    return "Aventura";
  }
  if (classicsPattern.test(text)) {
    return "Clássicos";
  }
  return "Outros";
}

function demoPrice(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000_007;
  }
  return 29.9 + (hash % 11) * 10;
}

function toBook(work: Work, locale: Locale): Book | null {
  const id = work.key.match(workKeyPattern)?.[1];
  const edition = work.editions?.docs.find(
    (item) =>
      item.title?.trim() && item.language?.includes(languageCode[locale])
  );
  const author = work.author_name?.find((item) => item.trim());
  if (!(id && edition?.title && author)) {
    return null;
  }
  const book = {
    author: { en: author, pt: author },
    coverId: edition.cover_i ?? work.cover_i ?? null,
    description: {
      en: "Open Library has no description for this edition yet.",
      pt: "A Open Library ainda não tem uma descrição para esta edição.",
    },
    genre: genreFromSubjects(work.subject ?? []),
    id,
    pages: work.number_of_pages_median ?? null,
    price: demoPrice(id),
    sourceLocale: locale,
    title: { en: edition.title, pt: edition.title },
    year: work.first_publish_year ?? null,
  };
  const parsed = bookSchema.safeParse(book);
  return parsed.success ? parsed.data : null;
}

async function search(
  q: string,
  locale: Locale,
  signal?: AbortSignal,
  limit = 48
) {
  await waitForSearchSlot(signal);
  const response = await api.get<unknown>("/search.json", {
    params: { fields, lang: locale, limit, q, sort: "readinglog" },
    signal,
  });
  return searchSchema.parse(response.data).docs;
}

export async function fetchCatalog(
  locale: Locale,
  term: string,
  signal?: AbortSignal
) {
  const safeTerm = term.replace(unsafeSearchPattern, " ").trim().slice(0, 80);
  const q = `${safeTerm ? `${safeTerm} AND ` : ""}language:${languageCode[locale]}`;
  const works = await search(q, locale, signal);
  return works
    .map((work) => toBook(work, locale))
    .filter((book): book is Book => book !== null);
}

export type BookLookup =
  | { status: "available"; book: Book }
  | { status: "language-unavailable" }
  | { status: "not-found" };

export async function fetchBook(
  id: string,
  locale: Locale,
  signal?: AbortSignal
): Promise<BookLookup> {
  if (!bookIdPattern.test(id)) {
    return { status: "not-found" };
  }
  const key = `key:/works/${id}`;
  const localized = await search(
    `${key} AND language:${languageCode[locale]}`,
    locale,
    signal,
    1
  );
  const book = localized[0] ? toBook(localized[0], locale) : null;
  if (book) {
    return { book, status: "available" };
  }
  const exists = await search(key, locale, signal, 1);
  return { status: exists.length ? "language-unavailable" : "not-found" };
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export const catalogQuery = (locale: Locale, term: string) =>
  queryOptions({
    gcTime: ONE_HOUR_MS,
    queryFn: ({ signal }) => fetchCatalog(locale, term, signal),
    queryKey: ["books", "catalog", locale, term] as const,
    retry: 1,
    staleTime: ONE_HOUR_MS,
  });

export const bookQuery = (id: string, locale: Locale) =>
  queryOptions({
    gcTime: ONE_HOUR_MS,
    queryFn: ({ signal }) => fetchBook(id, locale, signal),
    queryKey: ["books", "work", id, locale] as const,
    retry: 1,
    staleTime: ONE_HOUR_MS,
  });
