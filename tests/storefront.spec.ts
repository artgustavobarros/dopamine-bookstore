import { expect, test } from "@playwright/test";

const checkoutUrl = /\/checkout\/?$/;
const completeUrl = /\/checkout\/complete\//;
const ordersUrl = /\/orders/;
const homeUrl = /\/$/;
const darkClass = /dark/;

test("catalog to fictional order, review, and insights survives reload", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await expect(page.locator("#catalog article")).toHaveCount(18);
  await page.getByLabel("Buscar título ou autor").fill("crime");
  await expect(page.locator("#catalog article")).toHaveCount(1);
  await page.getByLabel("Buscar título ou autor").fill("");
  await page.getByRole("button", { exact: true, name: "Filosofia" }).click();
  await expect(page.locator("#catalog article")).toHaveCount(4);
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
  await expect(page.locator("main")).toContainText("Os Irmãos Karamázov");
  await page.reload();
  await expect(page.locator("main")).toContainText("Os Irmãos Karamázov");

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
  await expect(page.locator("main")).toContainText("Os Irmãos Karamázov");

  await page.getByRole("link", { name: "Os Irmãos Karamázov" }).click();
  await page
    .getByPlaceholder("O que achou das páginas que leu (se leu)?")
    .fill("Um livro para depois.");
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Um livro para depois.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Um livro para depois.")).toBeVisible();
  await page.getByRole("link", { name: "Estatísticas" }).first().click();
  await expect(page.locator("main")).toContainText("824");
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
