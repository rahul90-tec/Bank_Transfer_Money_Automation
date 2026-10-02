import { Page, Locator } from '@playwright/test';

/**
 * BasePage serves as the parent class for all ParaBank Page Objects.
 * Contains common interactions, wait helpers, left-menu navigation, and cross-cutting concerns.
 */
export abstract class BasePage {
  // Left menu navigation locators
  readonly openNewAccountLink: Locator;
  readonly accountsOverviewLink: Locator;
  readonly transferFundsLink: Locator;
  readonly billPayLink: Locator;
  readonly findTransactionsLink: Locator;
  readonly logOutLink: Locator;

  constructor(protected readonly page: Page) {
    this.openNewAccountLink = page.locator('#leftPanel a[href*="openaccount.htm"]');
    this.accountsOverviewLink = page.locator('#leftPanel a[href*="overview.htm"]');
    this.transferFundsLink = page.locator('#leftPanel a[href*="transfer.htm"]');
    this.billPayLink = page.locator('#leftPanel a[href*="billpay.htm"]');
    this.findTransactionsLink = page.locator('#leftPanel a[href*="findtrans.htm"]');
    this.logOutLink = page.locator('#leftPanel a[href*="logout.htm"]');
  }

  /**
   * Navigate to a relative path or full URL.
   */
  async navigateTo(path: string = '/parabank/index.htm'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get current page title.
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for URL to match a pattern or string.
   */
  async waitForUrl(urlOrPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlOrPattern);
  }

  /**
   * Navigate to Open New Account page via left menu.
   */
  async goToOpenNewAccount(): Promise<void> {
    await this.openNewAccountLink.click();
    await this.page.waitForURL(/.*openaccount\.htm/);
  }

  /**
   * Navigate to Accounts Overview page via left menu.
   */
  async goToAccountsOverview(): Promise<void> {
    await this.accountsOverviewLink.click();
    await this.page.waitForURL(/.*overview\.htm/);
  }

  /**
   * Navigate to Transfer Funds page via left menu.
   */
  async goToTransferFunds(): Promise<void> {
    await this.transferFundsLink.click();
    await this.page.waitForURL(/.*transfer\.htm/);
  }

  /**
   * Log out of current session.
   */
  async logOut(): Promise<void> {
    await this.logOutLink.click();
  }

  /**
   * Take screenshot with a given name.
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for network idle or domcontentloaded.
   */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
