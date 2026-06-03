import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { ProductsPage } from "../pages/products.page";
import { users } from "./test-data";

/**
 * Custom Playwright fixtures — extend the base test with project-specific behaviour.
 *
 * Demonstrates: Playwright fixture extension, DRY auth setup, typed fixture returns.
 * Pattern: each fixture is an async function that returns a setup context.
 * Fixtures are torn down automatically when the test finishes.
 */

/** Pre-authenticated page — already on /inventory.html, products visible */
type AuthenticatedContext = {
  authenticatedPage: ProductsPage;
};

/**
 * Fixture that logs in once per test and returns a ProductsPage ready for assertions.
 * Replaces the manual loginPage.goto() → loginPage.login() → new ProductsPage() boilerplate
 * that appears in every products/checkout test.
 */
export const test = base.extend<AuthenticatedContext>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    const productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryList).toBeVisible();

    await use(productsPage);
  },
});

export { expect };
