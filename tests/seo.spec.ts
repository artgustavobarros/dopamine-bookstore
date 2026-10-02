import { expect, test } from "@playwright/test";
import { z } from "zod";

const canonicalPattern = /<link[^>]+rel="canonical"[^>]*>/g;
const robotsPattern = /<meta[^>]+name="robots"[^>]*>/g;
const jsonLdPattern =
  /<script[^>]+type="application\/ld\+json"[^>]*>([^<]+)<\/script>/;

test("crawler HTML indexes only public content and has valid homepage structured data", async ({
  request,
}) => {
  const home = await (await request.get("/")).text();
  expect(home).toContain(
    'href="https://dopamine-bookstore.vercel.app/" rel="canonical"'
  );
  expect(home.match(robotsPattern)).toHaveLength(1);
  expect(home).toContain(
    'content="index, follow, max-image-preview:large" name="robots"'
  );
  expect(home).toContain('data-book-id="OL100W"');
  const script = home.match(jsonLdPattern)?.[1];
  expect(script).toBeTruthy();
  const graph = z
    .object({
      "@context": z.literal("https://schema.org"),
      "@graph": z
        .array(
          z.object({
            "@type": z.enum(["WebSite", "BookStore"]),
            description: z.string().min(1),
            name: z.string().min(1),
            url: z.url(),
          })
        )
        .length(2),
    })
    .parse(JSON.parse(script ?? "{}"));
  expect(graph["@graph"].map((entry) => entry["@type"])).toEqual([
    "WebSite",
    "BookStore",
  ]);
  expect(home).not.toContain('"@type":"FAQPage"');

  const book = await (await request.get("/books/OL100W")).text();
  expect(book.match(robotsPattern)).toHaveLength(1);
  expect(book).toContain(
    'href="https://dopamine-bookstore.vercel.app/books/OL100W" rel="canonical"'
  );
  expect(book).toContain("Dom Casmurro, de Machado de Assis");
  expect(book).toContain('property="og:url"');

  const privatePaths = [
    "/register",
    "/cart",
    "/checkout",
    "/account",
    "/orders",
    "/orders/demo/tracking",
    "/wishlist",
    "/stats",
    "/checkout/complete/demo",
    "/books/OL0W",
  ];
  const privatePages = await Promise.all(
    privatePaths.map(async (path) => ({
      html: await (await request.get(path)).text(),
      path,
    }))
  );
  for (const { path, html } of privatePages) {
    expect(html.match(robotsPattern), path).toHaveLength(1);
    expect(html, path).toContain('content="noindex, follow" name="robots"');
    expect(html.match(canonicalPattern), path).toBeNull();
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(
    "Sitemap: https://dopamine-bookstore.vercel.app/sitemap.xml"
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://dopamine-bookstore.vercel.app/");
  expect(sitemap).not.toContain("/account");
});

test("catalog and book remain readable with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Depois Eu Leio" })
    ).toBeVisible();
    await expect(page.locator("#catalog article")).toHaveCount(3);
    await page.goto("/books/OL100W");
    await expect(
      page.getByRole("heading", { level: 1, name: "Dom Casmurro" })
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("hydration reuses the server catalog without an immediate browser refetch", async ({
  page,
}) => {
  const searches: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/search.json")) {
      searches.push(request.url());
    }
  });
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page.waitForTimeout(500);
  expect(searches).toEqual([]);
});

test("hero heading is visible with reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Depois Eu Leio" })
    ).toBeVisible();
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
    expect(
      await page
        .getByRole("heading", { level: 1 })
        .evaluate((element) => getComputedStyle(element).visibility)
    ).toBe("visible");
  } finally {
    await context.close();
  }
});
