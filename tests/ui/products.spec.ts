import { test, expect } from "../../fixtures/custom-fixtures";
import { users } from "../../fixtures/test-data";

test.describe("Products", () => {
  /*
   * Uses the custom `authenticatedPage` fixture from fixtures/custom-fixtures.ts.
   * This replaces the manual login boilerplate in beforeEach with a typed fixture
   * that handles auth and returns a ready-to-use ProductsPage.
   */

  test("product list loads with items", async ({ authenticatedPage: productsPage }) => {
    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
    names.forEach((name) => expect(name.length).toBeGreaterThan(0));
  });

  test("add single item to cart updates badge", async ({ authenticatedPage: productsPage }) => {
    const initial = await productsPage.getCartCount();
    expect(initial).toBe(0);

    const itemName = await productsPage.addFirstItemToCart();
    expect(itemName.length).toBeGreaterThan(0);

    const count = await productsPage.getCartCount();
    expect(count).toBe(1);
  });

  test("sort by price low-to-high orders correctly", async ({ authenticatedPage: productsPage }) => {
    await productsPage.sortBy("lohi");

    // Grab prices from the page
    const prices = await productsPage.page
      .locator(".inventory_item_price")
      .allTextContents();
    const numeric = prices.map((p) => parseFloat(p.replace("$", "")));

    // Verify ascending order
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1]);
    }
  });

  test("sort by name Z-A reverses order", async ({ authenticatedPage: productsPage }) => {
    await productsPage.sortBy("za");
    const names = await productsPage.getAllProductNames();

    // Verify descending alphabetical order
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });
});
