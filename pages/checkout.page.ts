import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Checkout flow (Sauce Demo).
 * Demonstrates: multi-step form, data input, summary validation, completion.
 */
export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly itemTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator("[data-test='firstName']");
    this.lastNameInput = page.locator("[data-test='lastName']");
    this.postalCodeInput = page.locator("[data-test='postalCode']");
    this.continueButton = page.locator("[data-test='continue']");
    this.finishButton = page.locator("[data-test='finish']");
    this.completeHeader = page.locator(".complete-header");
    this.itemTotal = page.locator(".summary_subtotal_label");
  }

  async goto(): Promise<void> {
    await super.goto("/checkout-step-one.html");
  }

  async fillShippingInfo(first: string, last: string, zip: string): Promise<void> {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.postalCodeInput.fill(zip);
    await this.continueButton.click();
  }

  async completeOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async getCompletionMessage(): Promise<string> {
    return (await this.completeHeader.textContent()) ?? "";
  }
}
