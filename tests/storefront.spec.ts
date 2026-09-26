import { expect, test } from "@playwright/test";

const checkoutUrl = /\/checkout\/?$/;
const completeUrl = /\/checkout\/complete\//;
const ordersUrl = /\/orders/;
const homeUrl = /\/$/;
const darkClass = /dark/;
const workQueryPattern = /key:\/works\/(OL\d+W)/;
const habitsPattern = /habitos|hábitos|atomic/i;
const noMatchPattern = /nada/i;
const blackBgPattern = /bg-\[#141210\]/;
const redBgPattern = /bg-red/;
const blueBgPattern = /bg-blue/;

const works = [
  {
    author_name: ["Machado de Assis"],
    editions: {
      docs: [
        { key: "/books/OL100M", language: ["por"], title: "Dom Casmurro" },
      ],
    },
    first_publish_year: 1899,
    key: "/works/OL100W",
    number_of_pages_median: 208,
    subject: ["Classics"],
    title: "Dom Casmurro",
  },
  {
    author_name: ["James Clear"],
    editions: {
      docs: [
        { key: "/books/OL200M", language: ["por"], title: "Hábitos Atômicos" },
      ],
    },
    first_publish_year: 2018,
    key: "/works/OL200W",
    number_of_pages_median: 320,
    subject: ["Habit", "Personal Growth"],
    title: "Atomic Habits",
  },
  {
    author_name: ["Frank Herbert"],
    editions: {
      docs: [{ key: "/books/OL300M", language: ["por"], title: "Duna" }],
    },
    first_publish_year: 1965,
    key: "/works/OL300W",
    number_of_pages_median: 600,
    subject: ["Science fiction"],
    title: "Dune",
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/search.json?**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") ?? "";
    const english = query.includes("language:eng");
    const portuguese = query.includes("language:por");
    const workId = query.match(workQueryPattern)?.[1];
    let docs = workId
      ? works.filter((work) => work.key.endsWith(workId))
      : works;
    if (english) {
      docs = docs
        .filter((work) => work.key !== "/works/OL100W")
        .map((work) => ({
          ...work,
          editions: {
            docs: [
              {
                key: work.editions.docs[0].key,
                language: ["eng"],
                title: work.title,
              },
            ],
          },
        }));
    } else if (!(portuguese || workId)) {
      docs = [];
    }
    if (!workId && habitsPattern.test(query)) {
      docs = docs.filter((work) => work.key === "/works/OL200W");
    }
    if (!workId && noMatchPattern.test(query)) {
      docs = [];
    }
    await route.fulfill({
      body: JSON.stringify({ docs }),
      contentType: "application/json",
    });
  });
});

test("catalog to fictional order, review, and insights survives reload", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    if (error.message.includes("Failed to fetch dynamically imported module")) {
      return;
    }
    pageErrors.push(error.message);
  });
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page.getByLabel("Buscar título ou autor").fill("hábitos");
  await expect(page.locator("#catalog article")).toHaveCount(1);
  await page.getByLabel("Buscar título ou autor").fill("");
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page
    .getByRole("button", { exact: true, name: "Produtividade" })
    .click();
  await expect(page.locator("#catalog article")).toHaveCount(1);
  await page.getByRole("button", { exact: true, name: "Todos" }).click();

  await page
    .getByRole("button", { name: "Salvar nos desejos" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Adicionar ao carrinho" })
    .first()
    .click();
  await page.locator('header a[href="/cart"]').click();
  await expect(page.locator("main")).toContainText("Dom Casmurro");
  await page.reload();
  await expect(page.locator("main")).toContainText("Dom Casmurro");

  await page.getByRole("link", { name: "Ir para o checkout" }).click();
  await page.getByRole("link", { name: "Entrar e continuar" }).click();
  await page.getByLabel("Nome").fill("Ana Demo");
  await page.getByLabel("E-mail").fill("ana@example.com");
  await page.getByRole("button", { name: "Entrar e continuar" }).click();
  await expect(page).toHaveURL(checkoutUrl);
  await page.getByText("Pix de mentirinha").click();
  await page
    .getByRole("button", { name: "Concluir decisão questionável" })
    .click();
  await expect(page).toHaveURL(completeUrl);
  await expect(
    page.getByRole("heading", { name: "Pedido imaginário confirmado." })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Pedido imaginário confirmado." })
  ).toBeVisible();
  await page.goto("/checkout");
  await expect(
    page.getByText("Seu carrinho está vazio. Por enquanto.")
  ).toBeVisible();
  await page.goto("/orders");
  await expect(page).toHaveURL(ordersUrl);
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.locator("main")).toContainText("Dom Casmurro");

  await page.getByRole("link", { name: "Dom Casmurro" }).click();
  await page
    .getByPlaceholder("O que achou das páginas que leu (se leu)?")
    .fill("Um livro para depois.");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Um livro para depois.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Um livro para depois.")).toBeVisible();
  await page.getByRole("link", { name: "Estatísticas" }).first().click();
  await expect(page.locator("main")).toContainText("208");
  expect(pageErrors).toEqual([]);
});

test("mobile navigation, preferences, and invalid saved IDs", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "depois-eu-leio-v1",
      JSON.stringify({
        state: {
          cartIds: ["missing-book"],
          locale: "pt",
          orders: [],
          profile: null,
          reviews: {},
          theme: "light",
          wishlistIds: ["missing-book"],
        },
        version: 1,
      })
    );
  });
  await page.goto("/cart");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await expect(
    page.getByText("Seu carrinho está vazio. Por enquanto.")
  ).toBeVisible();
  await page.getByRole("button", { name: "Menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Loja" })
    .click();
  await expect(page).toHaveURL(homeUrl);
  await expect(
    page.locator('header button[aria-label="Alternar tema"]')
  ).toBeHidden();
  await expect(page.locator('header button[aria-label="Idioma"]')).toBeHidden();
  await page.getByRole("button", { name: "Menu" }).click();
  const sheet = page.locator('[data-slot="sheet-content"]');
  const preferences = sheet.locator('[data-slot="sheet-footer"]');
  await expect(preferences).toBeVisible();
  expect(
    await sheet
      .getByRole("navigation", { name: "Mobile navigation" })
      .evaluate((navigation) =>
        navigation.nextElementSibling?.getAttribute("data-slot")
      )
  ).toBe("sheet-footer");
  await preferences.getByRole("button", { name: "Alternar tema" }).click();
  await expect(sheet).toBeVisible();
  await preferences.getByRole("button", { name: "Idioma" }).click();
  await expect(sheet).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(darkClass);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Read It"
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
  await page.evaluate(() =>
    localStorage.setItem("depois-eu-leio-v1", "{broken")
  );
  await page.goto("/cart");
  await expect(
    page.getByText("Seu carrinho está vazio. Por enquanto.")
  ).toBeVisible();
});

test("sheet preferences stay at the bottom on short screens and return to the desktop header", async ({
  page,
}) => {
  await page.setViewportSize({ height: 320, width: 390 });
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Menu" }).click();

  const sheet = page.locator('[data-slot="sheet-content"]');
  const navigation = sheet.getByRole("navigation", {
    name: "Mobile navigation",
  });
  const preferences = sheet.locator('[data-slot="sheet-footer"]');
  await expect(
    preferences.getByRole("button", { name: "Idioma" })
  ).toBeInViewport();
  await expect(
    preferences.getByRole("button", { name: "Alternar tema" })
  ).toBeInViewport();
  expect(
    await navigation.evaluate(
      (element) => element.scrollHeight > element.clientHeight
    )
  ).toBe(true);
  await navigation.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(preferences).toBeInViewport();

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await page.setViewportSize({ height: 800, width: 1280 });
  await expect(
    page.locator("header").getByRole("button", { name: "Idioma" })
  ).toBeVisible();
  await expect(
    page.locator("header").getByRole("button", { name: "Alternar tema" })
  ).toBeVisible();
  await expect(page.locator('header button[aria-label="Menu"]')).toBeHidden();
});

test("language switch explains missing edition and keeps saved book readable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/");
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page.locator("#catalog article").first().scrollIntoViewIfNeeded();
  await page
    .locator("#catalog article")
    .first()
    .getByRole("button", { name: "Adicionar ao carrinho" })
    .click();
  await page.goto("/books/OL100W");
  await expect(
    page.getByRole("heading", { name: "Dom Casmurro" })
  ).toBeVisible();
  await page.locator('header button[aria-label="Idioma"]').click();
  await expect(
    page.getByText("This book has no English edition in Open Library.")
  ).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText("Dom Casmurro").first()).toBeVisible();
  await expect(
    page.getByText("This saved title is shown in its available language.")
  ).toBeVisible();
});

test("catalog distinguishes language-specific empty results and API errors", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page.getByLabel("Buscar título ou autor").fill("nada");
  await expect(
    page.getByText("Nenhum livro encontrado em português para esta busca.")
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator("#catalog article")).toHaveCount(3);
  await page.route("**/search.json?**", (route) =>
    route.fulfill({ body: "unavailable", status: 503 })
  );
  await page.getByLabel("Buscar título ou autor").fill("falha");
  await expect(
    page.getByText("O catálogo está indisponível agora.")
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tentar novamente" })
  ).toBeVisible();
});

test("hero renders 3 featured books with black styling and covers, and SEO/AEO metadata is present", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

  const heroBooks = page.locator("[data-hero-book]");
  await expect(heroBooks).toHaveCount(3);
  await Promise.all([
    expect(heroBooks.nth(0)).toHaveClass(blackBgPattern),
    expect(heroBooks.nth(1)).toHaveClass(blackBgPattern),
    expect(heroBooks.nth(2)).toHaveClass(blackBgPattern),
    expect(heroBooks.nth(0)).not.toHaveClass(redBgPattern),
    expect(heroBooks.nth(1)).not.toHaveClass(redBgPattern),
    expect(heroBooks.nth(2)).not.toHaveClass(blueBgPattern),
  ]);

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute(
    "href",
    "https://dopamine-bookstore.vercel.app/"
  );

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const jsonText = await jsonLd.textContent();
  expect(jsonText).toContain("WebSite");
  expect(jsonText).toContain("BookStore");
  expect(jsonText).toContain("FAQPage");
  expect(jsonText).toContain("Dopamine Bookstore");
});
