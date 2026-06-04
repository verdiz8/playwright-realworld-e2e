import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { ProductsPage } from "../../pages/products.page";
import { loginScenarios } from "../../fixtures/test-data";

test.describe("Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Data-driven: one test per scenario
  for (const { username, password, expected, errorContains } of loginScenarios) {
    test(`${expected === "success" ? "✓" : "✗"} ${username}`, async ({ page }) => {
      await loginPage.login(username, password);

      if (expected === "success") {
        // On success we should land on the products page
        await expect(page).toHaveURL(/inventory/);
        const productsPage = new ProductsPage(page);
        await expect(productsPage.inventoryList).toBeVisible();
      } else {
        // On failure, an error message should appear
        const msg = await loginPage.getErrorMessage();
        expect(msg.toLowerCase()).toContain(errorContains?.toLowerCase() ?? "error");
      }
    });
  }

  test("locked out user cannot proceed", async () => {
    await loginPage.login("locked_out_user", "secret_sauce");
    const msg = await loginPage.getErrorMessage();
    expect(msg).toContain("locked out");
  });
});
