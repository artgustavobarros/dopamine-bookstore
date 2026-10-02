import { expect, test } from "@playwright/test";

const titlePattern =
  /Crie seu perfil local de demonstração|Create your local demo profile/;
const submitRegisterPattern =
  /Criar perfil local e continuar|Create local profile/;
const homeUrlPattern = /\/$/;
const signOutPattern = /Sair|Sign out/;
const signInSubmitPattern = /Entrar e continuar|Sign in/;
const registerLinkPattern = /Criar perfil local|Create local profile/;
const registerUrlPattern = /\/register\?returnTo=%2Fcheckout/;
const loginLinkPattern = /Entrar|Sign in/;
const accountUrlPattern = /\/account\?returnTo=%2Fcheckout/;
const checkoutRegisterPattern =
  /Crie um perfil local para finalizar|Create a demo profile to finish order/;
const checkoutUrlPattern = /\/checkout/;
const completeOrderPattern =
  /Concluir decisão questionável|Complete questionable decision/;
const checkoutCompleteUrlPattern = /\/checkout\/complete\//;

test.describe("Registration and Authentication Flow", () => {
  test("validates registration fields, registers user, and persists auth in localStorage", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Verify title
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      titlePattern
    );

    // Test form validation: submit blank
    await page.getByRole("button", { name: submitRegisterPattern }).click();
    await expect(page.locator("[data-motion-alert]").first()).toBeVisible();

    // Register a local demo profile without a password.
    await page.locator("#register-name").fill("Dev Teste");
    await page.locator("#register-email").fill("dev@teste.com");
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await page.getByRole("button", { name: submitRegisterPattern }).click();

    // Should redirect to homepage and show logged in user in header
    await expect(page).toHaveURL(homeUrlPattern);
    await expect(page.locator("header").getByText("Dev")).toBeVisible();

    // Verify localStorage persistence
    const storageData = await page.evaluate(() => {
      const raw = localStorage.getItem("depois-eu-leio-v1");
      return raw ? JSON.parse(raw) : null;
    });

    expect(storageData?.state?.profile?.name).toBe("Dev Teste");
    expect(storageData?.state?.profile?.email).toBe("dev@teste.com");
    expect(storageData?.state?.users?.["dev@teste.com"]?.name).toBe(
      "Dev Teste"
    );
    expect(
      storageData?.state?.users?.["dev@teste.com"]?.password
    ).toBeUndefined();

    // Profile survives page reload
    await page.reload();
    await expect(page.locator("header").getByText("Dev")).toBeVisible();

    // Go to /account, verify profile view, then sign out
    await page.goto("/account");
    await expect(page.getByText("Dev Teste")).toBeVisible();
    await page.getByRole("button", { name: signOutPattern }).click();

    // Select the saved local profile by email.
    await expect(page.locator("#profile-email")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator("#profile-name")).toHaveCount(0);

    await page.locator("#profile-email").fill("unknown@teste.com");
    await page.getByRole("button", { name: signInSubmitPattern }).click();
    await expect(page.locator("[data-motion-alert]").first()).toBeVisible();

    await page.locator("#profile-email").fill("dev@teste.com");
    await page.getByRole("button", { name: signInSubmitPattern }).click();

    // Verified logged in again
    await expect(page.locator("header").getByText("Dev")).toBeVisible();
  });

  test("cross-navigation preserves returnTo parameter", async ({ page }) => {
    await page.goto("/account?returnTo=%2Fcheckout");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Click register link
    await page.getByRole("link", { name: registerLinkPattern }).click();
    await expect(page).toHaveURL(registerUrlPattern);

    // Click login link
    await page
      .locator("#main-content")
      .getByRole("link", { name: loginLinkPattern })
      .click();
    await expect(page).toHaveURL(accountUrlPattern);
  });

  test("rejects an external returnTo destination", async ({ page }) => {
    await page.goto("/register?returnTo=https%3A%2F%2Fexample.com");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
    await page.locator("#register-name").fill("Demo Reader");
    await page.locator("#register-email").fill("reader@example.com");
    await page.getByRole("button", { name: submitRegisterPattern }).click();
    await expect(page).toHaveURL(homeUrlPattern);
  });

  test("evicts orphan profile session on load if email is not in registered users", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "depois-eu-leio-v1",
        JSON.stringify({
          state: {
            bookCache: {},
            cartIds: [],
            locale: "pt",
            orders: [],
            profile: { email: "orphan@fake.com", name: "Orphan Reader" },
            reviews: {},
            theme: "light",
            users: {},
            wishlistIds: [],
          },
          version: 2,
        })
      );
    });

    await page.goto("/account");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // The orphan profile must be cleared, showing the login form instead of signed in
    await expect(page.locator("#profile-email")).toBeVisible();
    await expect(page.getByText("Orphan Reader")).toHaveCount(0);

    // In storage, profile is reset to null
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("depois-eu-leio-v1");
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored?.state?.profile).toBeNull();
  });

  test("blocks checkout for unauthenticated visitors and unlocks after registration", async ({
    page,
  }) => {
    // Seed cart with a valid book in localStorage but no profile or users
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "depois-eu-leio-v1",
        JSON.stringify({
          state: {
            bookCache: {
              OL100W: {
                author: { en: "Frank Herbert", pt: "Frank Herbert" },
                coverId: 100,
                description: { en: "Classic scifi", pt: "Clássico da ficção" },
                genre: "Ficção científica",
                id: "OL100W",
                pages: 600,
                price: 89.9,
                sourceLocale: "pt",
                title: { en: "Dune", pt: "Duna" },
                year: 1965,
              },
            },
            cartIds: ["OL100W"],
            locale: "pt",
            orders: [],
            profile: null,
            reviews: {},
            theme: "light",
            users: {},
            wishlistIds: [],
          },
          version: 2,
        })
      );
    });

    // Go to checkout
    await page.goto("/checkout");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Payment form (radio options) should NOT be present; unauthenticated panel is displayed
    await expect(page.locator('input[type="radio"]')).toHaveCount(0);
    const registerCta = page.getByRole("link", {
      name: checkoutRegisterPattern,
    });
    await expect(registerCta).toBeVisible();

    // Click register CTA from checkout
    await registerCta.click();
    await expect(page).toHaveURL(registerUrlPattern);

    // Fill registration form
    await page.locator("#register-name").fill("Comprador Real");
    await page.locator("#register-email").fill("comprador@real.com");
    await page.getByRole("button", { name: submitRegisterPattern }).click();

    // Should redirect back to checkout and show order form with signed-in user
    await expect(page).toHaveURL(checkoutUrlPattern);
    await expect(page.getByText("Comprador Real")).toBeVisible();
    await expect(page.locator('input[type="radio"]')).toHaveCount(3);

    // Complete order
    await page
      .getByRole("button", {
        name: completeOrderPattern,
      })
      .click();

    // Redirects to order confirmation
    await expect(page).toHaveURL(checkoutCompleteUrlPattern);
  });
});
