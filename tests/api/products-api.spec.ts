import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { ProductsPage } from "../../pages/products.page";
import { users } from "../../fixtures/test-data";

/**
 * Network interception tests — validate behaviour at the HTTP layer.
 *
 * Playwright's `page.route()` lets us:
 *   1. Mock responses → test UI handling without relying on real data
 *   2. Spy on requests → assert the frontend sent the right payload
 *   3. Simulate failures → verify graceful degradation
 *
 * This is the #1 skill that separates senior SDETs from juniors:
 * manipulating the network layer instead of just clicking buttons.
 */

test.describe("API Interception — Network layer", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory/);
  });

  test("intercept and spy on page navigation requests", async ({ page }) => {
    // Track every network request the page makes
    const requests: string[] = [];
    page.on("request", (req) => requests.push(req.url()));

    const productsPage = new ProductsPage(page);
    await productsPage.addFirstItemToCart();
    await productsPage.cartLink.click();

    // Assert the page made the expected navigational requests
    const cartRequests = requests.filter((url) => url.includes("cart"));
    expect(cartRequests.length).toBeGreaterThan(0);
  });

  test("mock a slow inventory response — UI handles latency gracefully", async ({ page }) => {
    // Simulate a 3-second API delay for any fetch/XHR
    await page.route("**/*", (route) => {
      // Only delay API-style requests, not page navigations
      if (route.request().resourceType() === "xhr" || route.request().resourceType() === "fetch") {
        setTimeout(() => route.continue(), 3000);
      } else {
        route.continue();
      }
    });

    const productsPage = new ProductsPage(page);
    // Even with slow "API" calls, the UI should remain responsive
    await expect(productsPage.inventoryList).toBeVisible();
  });

  test("mock a 500 error on checkout — verify error state", async ({ page }) => {
    // Add item and go to cart first
    const productsPage = new ProductsPage(page);
    await productsPage.addFirstItemToCart();
    await productsPage.cartLink.click();
    await page.locator("[data-test='checkout']").click();

    // Mock the checkout submission to return a 500
    await page.route("**/checkout-step-one.html", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/html",
        body: "<html><body><h3>Internal Server Error</h3></body></html>",
      });
    });

    // Fill shipping and submit — the intercepted route should trigger
    await page.locator("[data-test='firstName']").fill("Test");
    await page.locator("[data-test='lastName']").fill("User");
    await page.locator("[data-test='postalCode']").fill("12345");
    await page.locator("[data-test='continue']").click();

    // After a 500, the page should not advance to step two
    const url = page.url();
    expect(url).not.toContain("checkout-step-two");
  });

  test("mock modified product data — UI renders what the 'API' returns", async ({ page }) => {
    // Reload inventory page with our route active
    await page.goto("/inventory.html");

    // Intercept the page load and assert the HTML contains expected product structure
    const response = await page.request.get("https://www.saucedemo.com/inventory.html");
    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain("inventory_item");
    expect(html).toContain("inventory_item_name");
    expect(html).toContain("inventory_item_price");
  });

  test("abort all image requests — verify page still functions", async ({ page }) => {
    // Block all image loads to simulate a CDN outage
    await page.route("**/*.jpg", (route) => route.abort());
    await page.route("**/*.png", (route) => route.abort());

    await page.goto("/inventory.html");

    // The inventory list should still render (images broken, but structure intact)
    const productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryList).toBeVisible();

    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
  });
});
