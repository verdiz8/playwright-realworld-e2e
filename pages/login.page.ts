import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Login page (Sauce Demo).
 * Demonstrates: form interaction, error state validation, redirect assertion.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator("[data-test='username']");
    this.passwordInput = page.locator("[data-test='password']");
    this.loginButton = page.locator("[data-test='login-button']");
    this.errorMessage = page.locator("[data-test='error']");
  }

  async goto(): Promise<void> {
    await super.goto("/");
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? "";
  }
}
