import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { ProductsPage } from "../pages/products.page";
import { users } from "../fixtures/test-data";

test.describe("Products", () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryList).toBeVisible();
  });

  test("product list loads with items", async () => {
    const names = await productsPage.getAllProductNames();
    expect(names.length).toBeGreaterThan(0);
    names.forEach((name) => expect(name.length).toBeGreaterThan(0));
  });

  test("add single item to cart updates badge", async () => {
    const initial = await productsPage.getCartCount();
    expect(initial).toBe(0);

    const itemName = await productsPage.addFirstItemToCart();
    expect(itemName.length).toBeGreaterThan(0);

    const count = await productsPage.getCartCount();
    expect(count).toBe(1);
  });

  test("sort by price low-to-high orders correctly", async () => {
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

  test("sort by name Z-A reverses order", async () => {
    await productsPage.sortBy("za");
    const names = await productsPage.getAllProductNames();

    // Verify descending alphabetical order
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });
});
