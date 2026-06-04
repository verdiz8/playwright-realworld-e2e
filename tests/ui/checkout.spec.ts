import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { ProductsPage } from "../../pages/products.page";
import { CheckoutPage } from "../../pages/checkout.page";
import { users, shippingScenarios } from "../../fixtures/test-data";

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    // Log in and add an item to cart
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    const productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryList).toBeVisible();
    await productsPage.addFirstItemToCart();
    await productsPage.cartLink.click();
  });

  for (const shipping of shippingScenarios) {
    test(`complete checkout — ${shipping.firstName} ${shipping.lastName}`, async ({ page }) => {
      // Navigate to checkout
      await page.locator("[data-test='checkout']").click();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillShippingInfo(
        shipping.firstName,
        shipping.lastName,
        shipping.postalCode
      );

      // Verify on step two (overview)
      await expect(page).toHaveURL(/checkout-step-two/);

      // Verify item total is displayed
      const total = await checkoutPage.itemTotal.textContent();
      expect(total).toContain("$");

      // Complete
      await checkoutPage.completeOrder();
      const msg = await checkoutPage.getCompletionMessage();
      expect(msg).toContain("Thank you");
    });
  }

  test("checkout fails with missing first name", async ({ page }) => {
    await page.locator("[data-test='checkout']").click();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.continueButton.click();

    // Should show an error
    const error = page.locator("[data-test='error']");
    await expect(error).toBeVisible();
  });
});
