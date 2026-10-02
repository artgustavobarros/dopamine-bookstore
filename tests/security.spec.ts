import { expect, test } from "@playwright/test";
import { roastInputSchema } from "../src/lib/roast-input";
import { requestAiOrFallback } from "../src/lib/server/ai-gate";
import {
  checkSharedQuota,
  makeClientQuotaKey,
} from "../src/lib/server/ai-limit";
import { BoundedTtlCache } from "../src/lib/server/bounded-cache";

test("rejects oversized Gemini context before prompt construction", () => {
  expect(
    roastInputSchema.safeParse({ event: "book-added", title: "x".repeat(201) })
      .success
  ).toBe(false);
  expect(
    roastInputSchema.safeParse({
      event: "diagnosis",
      orders: Array.from({ length: 101 }, () => ({ books: [] })),
    }).success
  ).toBe(false);
  expect(
    roastInputSchema.safeParse({
      event: "book-added",
      total: Number.POSITIVE_INFINITY,
    }).success
  ).toBe(false);
  expect(
    roastInputSchema.safeParse({
      cart: Array.from({ length: 51 }, () => ({})),
      event: "book-added",
    }).success
  ).toBe(false);
  const parsed = roastInputSchema.parse({
    event: "book-added",
    password: "secret",
    title: "Book",
  });
  expect("password" in parsed).toBe(false);
});

test("shared quota counts requests across clients and fails closed", async () => {
  const counts = new Map<string, number>();
  const fakeFetch: typeof fetch = (_url, options) => {
    const command = JSON.parse(String(options?.body)) as [
      string,
      string,
      number,
      string,
      number,
    ];
    const [, , , key] = command;
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    return Promise.resolve(Response.json({ result: next }));
  };
  const secret = "s".repeat(32);
  const roastKey = makeClientQuotaKey("roast", "203.0.113.10", secret);
  const diagnosisKey = makeClientQuotaKey("diagnosis", "203.0.113.10", secret);
  expect(roastKey).not.toContain("203.0.113.10");
  expect(roastKey).not.toBe(diagnosisKey);
  const request = (key: string, limit: number, fetchImpl = fakeFetch) =>
    checkSharedQuota({
      fetchImpl,
      key,
      limit,
      token: "test",
      url: "https://example.upstash.io",
      windowMs: 60_000,
    });
  expect(await request(roastKey, 2)).toBe(true);
  expect(await request(roastKey, 2)).toBe(true);
  expect(await request(roastKey, 2)).toBe(false);
  expect(await request(diagnosisKey, 1)).toBe(true);
  expect(await request(diagnosisKey, 1)).toBe(false);
  expect(
    await request(roastKey, 2, () => Promise.reject(new Error("outage")))
  ).toBe(false);
});

test("roast cache evicts old entries and expires them", () => {
  let now = 0;
  const cache = new BoundedTtlCache<string>(2, 100, () => now);
  cache.set("first", "a");
  cache.set("second", "b");
  expect(cache.get("first")).toBe("a");
  cache.set("third", "c");
  expect(cache.get("second")).toBeUndefined();
  expect(cache.get("first")).toBe("a");
  now = 100;
  expect(cache.get("first")).toBeUndefined();
  expect(cache.get("third")).toBeUndefined();
});

test("Gemini is not called over budget and provider failures return fallback", async () => {
  let calls = 0;
  const provider = (): Promise<string> => {
    calls += 1;
    return Promise.reject(new Error("provider unavailable"));
  };
  expect(
    await requestAiOrFallback(
      () => Promise.resolve(false),
      provider,
      () => "fallback"
    )
  ).toBe("fallback");
  expect(calls).toBe(0);
  expect(
    await requestAiOrFallback(
      () => Promise.resolve(true),
      provider,
      () => "fallback"
    )
  ).toBe("fallback");
  expect(calls).toBe(1);
});

test("legacy local profiles lose plaintext password while keeping saved state", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const book = {
      author: { en: "Author", pt: "Autor" },
      coverId: null,
      description: { en: "Demo", pt: "Demo" },
      genre: "Clássicos",
      id: "OL100W",
      pages: 208,
      price: 49.9,
      sourceLocale: "pt",
      title: { en: "Demo", pt: "Demo" },
      year: 1900,
    };
    localStorage.setItem(
      "depois-eu-leio-v1",
      JSON.stringify({
        state: {
          bookCache: { OL100W: book },
          cartIds: ["OL100W"],
          locale: "pt",
          orders: [
            {
              createdAt: "2024-01-01T00:00:00.000Z",
              id: "order-legacy",
              items: [
                {
                  author: book.author,
                  genre: book.genre,
                  id: book.id,
                  pages: book.pages,
                  price: book.price,
                  title: book.title,
                },
              ],
              method: "pix",
              receiptConfirmed: false,
              skew: 0,
              totalPages: 208,
              totalPrice: 49.9,
            },
          ],
          profile: { email: "legacy@example.com", name: "Legacy" },
          reviews: {
            OL100W: [
              {
                createdAt: "2024-01-01T00:00:00.000Z",
                id: "review-legacy",
                name: "Legacy",
                stars: 5,
                text: "Saved review",
              },
            ],
          },
          theme: "light",
          users: {
            "legacy@example.com": {
              createdAt: "2024-01-01T00:00:00.000Z",
              email: "legacy@example.com",
              name: "Legacy",
              password: "plaintext",
            },
          },
          wishlistIds: ["OL100W"],
        },
        version: 2,
      })
    );
  });
  await page.reload();
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("depois-eu-leio-v1") ?? "{}")
  );
  expect(saved.version).toBe(3);
  expect(saved.state.users["legacy@example.com"].password).toBeUndefined();
  expect(saved.state.cartIds).toEqual(["OL100W"]);
  expect(saved.state.wishlistIds).toEqual(["OL100W"]);
  expect(saved.state.profile.name).toBe("Legacy");
  expect(saved.state.orders[0].id).toBe("order-legacy");
  expect(saved.state.reviews.OL100W[0].id).toBe("review-legacy");
});
