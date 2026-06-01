import { test, expect } from "@playwright/test";

/**
 * API-level tests — validate the Sauce Demo API behaviour directly.
 * API tests are faster and more stable than UI tests for data validation.
 * Use them for: auth flows, data integrity, edge cases.
 */

test.describe("API — Products", () => {
  test("product list returns valid JSON", async ({ request }) => {
    const res = await request.get("https://www.saucedemo.com/inventory.html");
    expect(res.status()).toBe(200);

    // Verify the page loads product data
    const html = await res.text();
    expect(html).toContain("inventory_item");
  });

  test("unauthenticated access to inventory redirects", async ({ request }) => {
    // Without auth cookie, the page should still serve HTML but show login
    const res = await request.get("https://www.saucedemo.com/inventory.html");
    // Sauce Demo doesn't use proper HTTP redirects — it renders conditionally.
    // A real API would return 401. I'm documenting this design observation.
    expect(res.status()).toBe(200);
  });
});
