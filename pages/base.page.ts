import { type Locator, type Page } from "@playwright/test";

/**
 * Base page class — every page object extends this.
 * Centralises shared behaviour: navigation, wait strategies, common selectors.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a path relative to baseURL */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /** Wait for the page to be fully interactive */
  async waitForApp(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /** Get the current URL */
  get url(): string {
    return this.page.url();
  }
}
