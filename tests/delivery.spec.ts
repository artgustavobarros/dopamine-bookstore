import { expect, test } from "@playwright/test";
import {
  calculateDeliveryState,
  DEFAULT_BASE_SECONDS,
  DELIVERY_STAGES,
  getStageStarts,
} from "../src/lib/delivery";
import type { Order } from "../src/lib/store";

const REGEX_CHECKOUT_URL = /\/checkout\/?$/;
const REGEX_CHECKOUT_COMPLETE_URL = /\/checkout\/complete\/.+/;
const REGEX_ORDERS_TRACKING_URL = /\/orders\/.*\/tracking/;
const REGEX_TRACK_CTA = /Acompanhar entrega/;
const REGEX_SKIP_BTN = /Adiantar etapa/;
const REGEX_ORDERS_LINK = /Pedidos/;
const REGEX_CONFIRM_BTN = /Confirmar recebimento da compra/;

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
];

test.beforeEach(async ({ page }) => {
  await page.route("**/search.json?**", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ docs: works }),
      contentType: "application/json",
    });
  });
});

test.describe("Delivery Tracking Logic & Calculations", () => {
  test("calculates stage timing and weights according to 2-minute prototype baseline", () => {
    expect(DELIVERY_STAGES.length).toBe(8);
    const starts = getStageStarts(DEFAULT_BASE_SECONDS);
    expect(starts).toEqual([0, 8, 24, 40, 64, 96, 120, 120]);

    const fakeOrder: Order = {
      createdAt: new Date(1_000_000).toISOString(),
      id: "test-order-123",
      items: [
        {
          author: { en: "Author", pt: "Autor" },
          genre: "fiction",
          id: "book-1",
          pages: 300,
          price: 50,
          title: { en: "Book 1", pt: "Livro 1" },
        },
      ],
      method: "pix",
      receiptConfirmed: false,
      skew: 0,
      totalPages: 300,
      totalPrice: 50,
    };

    // At 0s: Pedido confirmado
    const s0 = calculateDeliveryState(fakeOrder, "pt", 1_000_000);
    expect(s0.stageIndex).toBe(0);
    expect(s0.currentStage.label.pt).toBe("Pedido confirmado");
    expect(s0.delivered).toBe(false);

    // At 10s: Separando na estante (starts at 8s)
    const s1 = calculateDeliveryState(fakeOrder, "pt", 1_010_000);
    expect(s1.stageIndex).toBe(1);
    expect(s1.currentStage.label.pt).toBe("Separando na estante");

    // At 30s: Embalado (starts at 24s)
    const s2 = calculateDeliveryState(fakeOrder, "pt", 1_030_000);
    expect(s2.stageIndex).toBe(2);
    expect(s2.currentStage.label.pt).toBe("Embalado");

    // At 50s: Saiu do centro de distribuição (starts at 40s)
    const s3 = calculateDeliveryState(fakeOrder, "pt", 1_050_000);
    expect(s3.stageIndex).toBe(3);
    expect(s3.currentStage.label.pt).toBe("Saiu do centro de distribuição");

    // At 70s: Em trânsito (starts at 64s)
    const s4 = calculateDeliveryState(fakeOrder, "pt", 1_070_000);
    expect(s4.stageIndex).toBe(4);
    expect(s4.currentStage.label.pt).toBe("Em trânsito");

    // At 100s: Saiu para entrega (starts at 96s)
    const s5 = calculateDeliveryState(fakeOrder, "pt", 1_100_000);
    expect(s5.stageIndex).toBe(5);
    expect(s5.currentStage.label.pt).toBe("Saiu para entrega");

    // At 125s: Stage 6 (Aguardando confirmação, Step 7 of 8, starts at 120s)
    const s6 = calculateDeliveryState(fakeOrder, "pt", 1_125_000);
    expect(s6.stageIndex).toBe(6);
    expect(s6.currentStage.label.pt).toBe("Aguardando confirmação");
    expect(s6.arrived).toBe(true);
    expect(s6.confirmed).toBe(false);
    expect(s6.delivered).toBe(false);
    expect(s6.pct).toBe(88);

    // When receiptConfirmed is true: Stage 7 (Recebimento confirmado, Step 8 of 8)
    const confirmedOrder: Order = {
      ...fakeOrder,
      confirmedReceiptAt: new Date(1_130_000).toISOString(),
      receiptConfirmed: true,
    };
    const s7 = calculateDeliveryState(confirmedOrder, "pt", 1_130_000);
    expect(s7.stageIndex).toBe(7);
    expect(s7.currentStage.label.pt).toBe("Recebimento confirmado");
    expect(s7.arrived).toBe(true);
    expect(s7.confirmed).toBe(true);
    expect(s7.delivered).toBe(true);
    expect(s7.pct).toBe(100);

    // Test with skew: skipping 50s from 0s advances to stage 3
    const orderWithSkew = { ...fakeOrder, skew: 50 };
    const sSkew = calculateDeliveryState(orderWithSkew, "pt", 1_000_000);
    expect(sSkew.stageIndex).toBe(3);
    expect(sSkew.currentStage.label.pt).toBe("Saiu do centro de distribuição");
  });
});

test.describe("Delivery Tracking End-to-End Flow", () => {
  test("progresses from checkout to confirmation, tracks delivery, and skips stages", async ({
    page,
  }) => {
    // 1. Open catalog and add book to cart
    await page.goto("/");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    await page.locator("#catalog").scrollIntoViewIfNeeded();
    const firstArticle = page.locator("#catalog article").first();
    await expect(firstArticle).toBeVisible();
    await firstArticle
      .getByRole("button", { name: "Adicionar ao carrinho" })
      .click();

    // 2. Go to cart
    await page.locator('header a[href="/cart"]').click();
    await expect(
      page.getByRole("link", { name: "Ir para o checkout" })
    ).toBeVisible();
    await page.getByRole("link", { name: "Ir para o checkout" }).click();

    // 3. Register user
    await page
      .getByRole("link", { name: "Cadastre-se para finalizar" })
      .click();
    const uniqueEmail = `test-${Date.now()}@exemplo.com`;
    await page.locator("#register-name").fill("Arthur Teste");
    await page.locator("#register-email").fill(uniqueEmail);
    await page.locator("#register-password").fill("123456");
    await page.locator("#register-confirm-password").fill("123456");
    await page.getByRole("button", { name: "Criar conta e continuar" }).click();

    // 4. Fill address in checkout if needed, or complete order
    await expect(page).toHaveURL(REGEX_CHECKOUT_URL);
    await page.locator("#co-new-label").fill("Casa");
    await page.locator("#co-new-cep").fill("01001-000");
    await page.locator("#co-new-street").fill("Praça da Sé");
    await page.locator("#co-new-number").fill("100");
    await page.locator("#co-new-city").fill("São Paulo");
    await page.locator("#co-new-uf").fill("SP");

    // Select None
    await page.getByText("Nenhuma, obrigado").click();
    await page
      .getByRole("button", { name: "Concluir decisão questionável" })
      .click();

    // 5. Verification on Confirmation Screen
    await expect(page).toHaveURL(REGEX_CHECKOUT_COMPLETE_URL);
    await expect(page.locator("h1")).toHaveText(
      "Pedido imaginário confirmado."
    );
    await expect(page.getByText("não gastos")).toBeVisible();
    await expect(
      page.getByText("páginas adicionadas à sua consciência")
    ).toBeVisible();

    // Primary CTA: Acompanhar entrega
    const trackCTA = page.getByRole("link", { name: REGEX_TRACK_CTA });
    await expect(trackCTA).toBeVisible();
    await trackCTA.click();

    // 6. Verification on Tracking Screen
    await expect(page).toHaveURL(REGEX_ORDERS_TRACKING_URL);
    await expect(page.locator("h1")).toContainText("Pedido confirmado");
    await expect(page.locator("section").first()).toContainText("Etapa 1 de 8");

    // Timeline exists
    const timeline = page.locator("section:has-text('Etapas da entrega')");
    await expect(timeline).toBeVisible();
    await expect(timeline).toContainText("Separando na estante");
    await expect(timeline).toContainText("Embalado");
    await expect(timeline).toContainText("Saiu do centro de distribuição");

    // Test prototype skip button
    const skipBtn = page.getByRole("button", { name: REGEX_SKIP_BTN });
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();

    // Should now be at Stage 2
    await expect(page.locator("h1")).toContainText("Separando na estante");
    await expect(page.locator("section").first()).toContainText("Etapa 2 de 8");

    // 7. Verify /orders page reflects the stage
    await page
      .getByRole("link", { name: REGEX_ORDERS_LINK })
      .first()
      .click();
    await expect(page).toHaveURL("/orders");

    const orderArticle = page.locator("article").first();
    await expect(orderArticle).toBeVisible();
    await expect(orderArticle).toContainText("Separando na estante");
    await expect(
      orderArticle.getByRole("link", { name: REGEX_TRACK_CTA })
    ).toBeVisible();
  });

  test("allows user to confirm receipt when delivered, persisting status and displaying confirmed badge in orders", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    const orderId = "order-delivered-test";
    await page.evaluate((id) => {
      const storageKey = "depois-eu-leio-v1";
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 2 };
      parsed.state.orders = [
        {
          createdAt: new Date(Date.now() - 200_000).toISOString(),
          id,
          items: [
            {
              author: { en: "Machado de Assis", pt: "Machado de Assis" },
              genre: "Classics",
              id: "book-1",
              pages: 208,
              price: 49.9,
              title: { en: "Dom Casmurro", pt: "Dom Casmurro" },
            },
          ],
          method: "card",
          receiptConfirmed: false,
          skew: 0,
          totalPages: 208,
          totalPrice: 49.9,
        },
      ];
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    }, orderId);

    await page.goto(`/orders/${orderId}/tracking`);
    await expect(page.locator("h1")).toContainText("Aguardando confirmação");
    await expect(page.locator("section").first()).toContainText("Etapa 7 de 8");

    const promptCard = page.locator("aside");
    await expect(promptCard.getByText("AGUARDANDO CONFIRMAÇÃO!")).toBeVisible();
    await expect(
      promptCard.getByText("Confirmar recebimento", { exact: true })
    ).toBeVisible();
    const confirmBtn = promptCard.getByRole("button", {
      name: REGEX_CONFIRM_BTN,
    });
    await expect(confirmBtn).toBeVisible();

    await confirmBtn.click();

    await expect(page.locator("h1")).toContainText("Recebimento confirmado");
    await expect(page.locator("section").first()).toContainText("Etapa 8 de 8");
    await expect(promptCard.getByText("RECEBIMENTO CONFIRMADO!")).toBeVisible();
    await expect(confirmBtn).not.toBeVisible();

    await page.reload();
    await expect(promptCard.getByText("RECEBIMENTO CONFIRMADO!")).toBeVisible();

    await page.goto("/orders");
    const orderArticle = page.locator("article").first();
    await expect(orderArticle).toBeVisible();
    await expect(
      orderArticle.getByText("Recebimento confirmado")
    ).toBeVisible();
  });
});
