import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Book } from "../catalog";
import { type BookLookup, fetchBook, fetchCatalog } from "../open-library";

const CACHE_TTL_MS = 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 4000;
const MAX_BOOK_ENTRIES = 128;
const bookIdPattern = /^OL\d+W$/;

interface Cached<T> {
  expiresAt: number;
  value: T;
}

let catalogCache: Cached<Book[]> | null = null;
let catalogPending: Promise<Book[]> | null = null;
const bookCache = new Map<string, Cached<BookLookup>>();
const bookPending = new Map<string, Promise<BookLookup>>();

async function loadDefaultCatalog(): Promise<Book[]> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) {
    return catalogCache.value;
  }
  if (!catalogPending) {
    catalogPending = fetchCatalog(
      "pt",
      "",
      AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    )
      .then((books) => {
        catalogCache = { expiresAt: Date.now() + CACHE_TTL_MS, value: books };
        return books;
      })
      .catch((error: unknown) => {
        console.warn(
          "[Catalog] Default catalog unavailable:",
          error instanceof Error ? error.message : "unknown error"
        );
        return catalogCache?.value ?? [];
      })
      .finally(() => {
        catalogPending = null;
      });
  }
  return await catalogPending;
}

async function loadBook(id: string): Promise<BookLookup> {
  if (!bookIdPattern.test(id)) {
    return { status: "not-found" };
  }
  const cached = bookCache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  const pending = bookPending.get(id);
  if (pending) {
    return pending;
  }
  const request = fetchBook(id, "pt", AbortSignal.timeout(UPSTREAM_TIMEOUT_MS))
    .then((result) => {
      bookCache.delete(id);
      bookCache.set(id, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        value: result,
      });
      if (bookCache.size > MAX_BOOK_ENTRIES) {
        const oldestKey = bookCache.keys().next().value;
        if (oldestKey) {
          bookCache.delete(oldestKey);
        }
      }
      return result;
    })
    .catch((error: unknown) => {
      console.warn(
        "[Catalog] Book lookup unavailable:",
        error instanceof Error ? error.message : "unknown error"
      );
      return cached?.value ?? { status: "not-found" as const };
    })
    .finally(() => {
      bookPending.delete(id);
    });
  bookPending.set(id, request);
  return await request;
}

export const getDefaultCatalogFn = createServerFn({ method: "GET" }).handler(
  loadDefaultCatalog
);

export const getBookForPageFn = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().max(32).catch("").parse(id))
  .handler(({ data }) => loadBook(data));
