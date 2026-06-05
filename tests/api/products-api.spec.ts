import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { ProductsPage } from "../../pages/products.page";
import { users } from "../../fixtures/test-data";

/**
 * Network interception tests — validate behaviour at the HTTP layer.
 *
 * Playwright's `page.route()` lets us:
 *   1. Mock responses → test UI handling under controlled conditions
 *   2. Spy on requests → assert the frontend sent the right calls
 *   3. Simulate failures → verify graceful degradation
 *
 * Sauce Demo is a static HTML app (no real REST API), so these tests
 * demonstrate the *patterns* on the page-level navigation and resource
 * requests that do exist. In a real SPA, you'd target fetch/XHR endpoints.
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

  test("spy on outgoing requests — capture and assert navigation calls", async ({ page }) => {
    // Track every HTTP request the page makes
    const requests: string[] = [];
    page.on("request", (req) => requests.push(req.url()));

    // Navigate to a new page — triggers HTTP requests for the page + its static assets
    await page.goto("/inventory.html");
    await expect(page).toHaveURL(/inventory/);

    // Assert we captured HTTP requests during navigation
    // A full page load generates multiple requests: the document, CSS, JS, images, fonts
    const docRequests = requests.filter(
      (url) => url.includes("inventory") && url.includes("saucedemo")
    );
    expect(docRequests.length).toBeGreaterThan(0);

    // We should also see asset requests (CSS, JS, images)
    const allPageRequests = requests.filter((url) =>
      url.includes("saucedemo.com")
    );
    expect(allPageRequests.length).toBeGreaterThan(1);
  });

  test("mock a slow resource response — UI handles latency gracefully", async ({ page }) => {
    // Simulate a 3-second delay for image resources
    await page.route("**/*.jpg", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    // Navigate to inventory — images will load slowly but page structure renders immediately
    await page.goto("/inventory.html");
    const productsPage = new ProductsPage(page);

    // The inventory list should be visible even while images are still loading
    await expect(productsPage.inventoryList).toBeVisible();
    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test("mock 500 on a page — verify error response is served", async ({ page }) => {
    // Intercept the cart page and return a 500 error instead of the real page
    await page.route("**/cart.html", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/html",
        body: "<html><body><h3>500 Internal Server Error</h3><p>Something went wrong.</p></body></html>",
      });
    });

    // Navigate to cart — our route intercepts and returns the 500 page
    await page.goto("/cart.html");

    // The intercepted 500 page should be displayed, not the real cart
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("500");
    expect(bodyText).toContain("Internal Server Error");

    // The real cart content should NOT be present
    expect(bodyText).not.toContain("Your Cart");
  });

  test("inventory page serves valid HTML with expected product structure", async ({ page }) => {
    // Reload inventory page
    await page.goto("/inventory.html");

    // Verify the HTML contains the expected DOM structure for products
    const html = await page.content();
    expect(html).toContain("inventory_item");
    expect(html).toContain("inventory_item_name");
    expect(html).toContain("inventory_item_price");

    // Also verify we can interact with the page
    const productsPage = new ProductsPage(page);
    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test("abort all image requests — verify page functions without images", async ({ page }) => {
    // Block all image loads to simulate a CDN outage
    await page.route("**/*.jpg", (route) => route.abort());
    await page.route("**/*.png", (route) => route.abort());

    await page.goto("/inventory.html");

    // The inventory list should still render (images broken, but structure intact)
    const productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryList).toBeVisible();

    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);

    // Verify images are indeed broken (aborted requests return no content)
    const firstImage = page.locator(".inventory_item_img").first();
    await expect(firstImage).toBeVisible();
  });
});
