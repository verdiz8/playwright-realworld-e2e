import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Products inventory page (Sauce Demo).
 * Demonstrates: list filtering, sorting, item detail navigation, add-to-cart.
 */
export class ProductsPage extends BasePage {
  readonly inventoryList: Locator;
  readonly sortDropdown: Locator;
  readonly addToCartButtons: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.locator(".inventory_list");
    this.sortDropdown = page.locator("[data-test='product-sort-container']");
    this.addToCartButtons = page.locator("button:has-text('Add to cart')");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator(".shopping_cart_link");
  }

  async goto(): Promise<void> {
    await super.goto("/inventory.html");
  }

  async addFirstItemToCart(): Promise<string> {
    const firstItem = this.inventoryList.locator(".inventory_item").first();
    const name = await firstItem.locator(".inventory_item_name").textContent();
    await firstItem.locator("button:has-text('Add to cart')").click();
    return name ?? "Unknown item";
  }

  async addItemByName(itemName: string): Promise<void> {
    const item = this.inventoryList.locator(".inventory_item", {
      has: this.page.locator(`.inventory_item_name:has-text("${itemName}")`),
    });
    await item.locator("button:has-text('Add to cart')").click();
  }

  async getCartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async sortBy(option: "az" | "za" | "lohi" | "hilo"): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getAllProductNames(): Promise<string[]> {
    return await this.inventoryList
      .locator(".inventory_item_name")
      .allTextContents();
  }
}
