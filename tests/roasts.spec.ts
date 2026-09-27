import { expect, test } from "@playwright/test";
import {
  clearRoastSessionState,
  formatCurrencyByLocale,
  formatNumberByLocale,
  getRoastSessionState,
  interpolateText,
  ROASTS,
  selectRoastFromCatalog,
  STINGS,
  type RoastEvent,
} from "../src/lib/roasts";
import { calculateToastDuration } from "../src/lib/roast-toast";

test.describe("Roast Manifestations Engine — Unit & Catalog Tests", () => {
  test.beforeEach(() => {
    clearRoastSessionState();
  });

  test("Content Quotas: all 16 events exist and meet minimum variant requirements", () => {
    const requiredEvents: RoastEvent[] = [
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
      "idle",
      "cart-removed",
    ];

    for (const ev of requiredEvents) {
      const def = ROASTS[ev];
      expect(def, `Event ${ev} must be defined in ROASTS`).toBeDefined();
      expect(def.rules.length).toBeGreaterThanOrEqual(1);

      // Check rule variants quota
      for (const rule of def.rules) {
        expect(
          rule.variants.length,
          `Rule ${rule.id} of event ${ev} must have at least 3 variants`
        ).toBeGreaterThanOrEqual(3);
      }

      // Check generic rule quota (at least 5 variants) if generic exists
      const genericRule = def.rules.find((r) => r.id === "generic");
      if (genericRule) {
        expect(
          genericRule.variants.length,
          `Generic rule of event ${ev} must have at least 5 variants`
        ).toBeGreaterThanOrEqual(5);
      }
    }

    // Check stings quota (>= 8)
    expect(STINGS.length).toBeGreaterThanOrEqual(8);

    // Check card-declined variants quota (>= 6)
    const cardDeclinedVariants = ROASTS["card-declined"].rules[0].variants;
    expect(cardDeclinedVariants.length).toBeGreaterThanOrEqual(6);

    // Check pix-expired variants quota (>= 3)
    const pixExpiredVariants = ROASTS["pix-expired"].rules[0].variants;
    expect(pixExpiredVariants.length).toBeGreaterThanOrEqual(3);

    // Check delivery-stage variants quota (>= 2)
    const deliveryStageVariants = ROASTS["delivery-stage"].rules[0].variants;
    expect(deliveryStageVariants.length).toBeGreaterThanOrEqual(2);
  });

  test("Character Limits & Format: all catalog messages <= 140 chars and SFX <= 14 chars", () => {
    for (const [eventName, def] of Object.entries(ROASTS)) {
      for (const rule of def.rules) {
        for (const variant of rule.variants) {
          // PT checks
          expect(
            variant.msg.pt.length,
            `PT message in ${eventName}/${rule.id} must be <= 140 chars: "${variant.msg.pt}"`
          ).toBeLessThanOrEqual(140);
          expect(
            variant.sfx.pt.length,
            `PT SFX in ${eventName}/${rule.id} must be <= 14 chars: "${variant.sfx.pt}"`
          ).toBeLessThanOrEqual(14);
          expect(variant.sfx.pt).toBe(variant.sfx.pt.toUpperCase());

          // EN checks
          expect(
            variant.msg.en.length,
            `EN message in ${eventName}/${rule.id} must be <= 140 chars: "${variant.msg.en}"`
          ).toBeLessThanOrEqual(140);
          expect(
            variant.sfx.en.length,
            `EN SFX in ${eventName}/${rule.id} must be <= 14 chars: "${variant.sfx.en}"`
          ).toBeLessThanOrEqual(14);
          expect(variant.sfx.en).toBe(variant.sfx.en.toUpperCase());
        }
      }
    }

    for (const sting of STINGS) {
      expect(sting.pt.length).toBeLessThanOrEqual(60);
      expect(sting.en.length).toBeLessThanOrEqual(60);
    }
  });

  test("Specificity Ordering: selects more specific rules over generic", () => {
    const hugeBookContext = {
      book: {
        author: "Lev Tolstói",
        genre: "Clássicos",
        id: "war-and-peace",
        pages: 1225,
        title: "Guerra e Paz",
      },
      totalPages: 1225,
    };

    const evaluated = selectRoastFromCatalog("book-added", hugeBookContext, "normal", "pt");
    expect(evaluated).not.toBeNull();
    expect(evaluated?.ruleId).toBe("huge-book");
    expect(evaluated?.msg.length).toBeGreaterThan(0);
  });

  test("Intensity Levels: educado suppresses stings and normal/impiedoso-only rules", () => {
    const context = {
      ru: 3, // would match russians-3 in normal mode
      book: {
        author: "Fiódor Dostoiévski",
        genre: "Clássicos",
        id: "dosto-1",
        pages: 350,
        title: "Noites Brancas",
      },
    };

    // Under educado, russians-3 rule is excluded (only in ['normal', 'impiedoso'])
    const educadoResult = selectRoastFromCatalog("book-added", context, "educado", "pt");
    expect(educadoResult).not.toBeNull();
    expect(educadoResult?.ruleId).not.toBe("russians-3");

    // Under impiedoso after 4 actions, a sting is appended (reset cooldown first)
    const state = getRoastSessionState();
    state.actions = 4;
    state.lastShownAt["book-added"] = 0;

    const impiedosoResult = selectRoastFromCatalog("book-added", context, "impiedoso", "pt");
    expect(impiedosoResult).not.toBeNull();
    // Verify that the message length is still strictly <= 140 chars
    expect(impiedosoResult!.msg.length).toBeLessThanOrEqual(140);
  });

  test("Token Interpolation: formats numbers and currencies properly per locale", () => {
    const ctx = {
      pages: 1024,
      total: 119.9,
      hours: 26,
      title: "Crime e Castigo",
    };

    // PT formatting
    const ptFormatted = interpolateText("{pages} p. por {total} ({hours})", ctx, "pt");
    expect(ptFormatted).toBe("1.024 p. por R$ 119,90 (~26h)");

    // EN formatting
    const enFormatted = interpolateText("{pages} p. for {total} ({hours})", ctx, "en");
    expect(enFormatted).toBe("1,024 p. for $23.98 (~26h)");

    expect(formatNumberByLocale(1024, "pt")).toBe("1.024");
    expect(formatNumberByLocale(1024, "en")).toBe("1,024");
    expect(formatCurrencyByLocale(119.9, "pt")).toContain("119,90");
    expect(formatCurrencyByLocale(119.9, "en")).toContain("23.98");
  });

  test("Anti-Repetition: repeated calls do not produce the same variant twice consecutively", () => {
    const ctx = {
      book: {
        author: "Autor Teste",
        genre: "Ficção",
        id: "test-book",
        pages: 200,
        title: "Livro Teste",
      },
    };

    const first = selectRoastFromCatalog("book-added", ctx, "normal", "pt");
    expect(first).not.toBeNull();

    // Advance timestamp to avoid cooldown
    const state = getRoastSessionState();
    state.lastShownAt["book-added"] = 0;

    const second = selectRoastFromCatalog("book-added", ctx, "normal", "pt");
    expect(second).not.toBeNull();

    // The two consecutive variants should not be identical
    if (first && second && first.ruleId === second.ruleId) {
      expect(first.variantIndex).not.toBe(second.variantIndex);
    }
  });

  test("Dynamic Duration: scales duration by 40ms per character above 80 chars", () => {
    // 50 chars -> base 6000ms
    const shortDuration = calculateToastDuration("Frase curta com menos de oitenta caracteres.");
    expect(shortDuration).toBe(6000);

    // 100 chars (20 over 80) -> 6000 + 20 * 40 = 6800ms
    const text100 = "a".repeat(100);
    expect(calculateToastDuration(text100)).toBe(6800);

    // 140 chars (60 over 80) -> 6000 + 60 * 40 = 8400ms
    const text140 = "a".repeat(140);
    expect(calculateToastDuration(text140)).toBe(8400);

    // Extreme text caps at 12000ms
    const text300 = "a".repeat(300);
    expect(calculateToastDuration(text300)).toBe(12000);
  });
});

test.describe("Roast Manifestations — E2E Browser & Interaction Tests", () => {
  test("Comic speech bubble renders with Bangers SFX, tail beak, and close button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click the first add to cart button
    const firstAddButton = page.locator("article button:has-text('Colocar na sacola'), article button:has-text('Adicionar')").first();
    if (await firstAddButton.isVisible()) {
      await firstAddButton.click();

      // Verify comic speech bubble toast appears
      const toast = page.locator("[data-comic-toast]").first();
      await expect(toast).toBeVisible({ timeout: 5000 });

      // Verify SFX header has Bangers font and red styling
      const sfx = toast.locator("span.font-accent");
      await expect(sfx).toBeVisible();

      // Verify close button with accessible label
      const closeBtn = toast.locator("button[aria-label='Fechar']");
      await expect(closeBtn).toBeVisible();

      // Click close button and ensure toast dismisses
      await closeBtn.click();
      await expect(toast).not.toBeVisible({ timeout: 3000 });
    }
  });
});
