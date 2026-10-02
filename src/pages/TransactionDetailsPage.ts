import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for ParaBank Transaction Details (transaction.htm).
 */
export class TransactionDetailsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly detailsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.detailsTable = page.locator('#rightPanel table');
  }

  /**
   * Extract key-value transaction attributes.
   */
  async getDetails(): Promise<Record<string, string>> {
    await this.detailsTable.waitFor({ state: 'visible', timeout: 15000 });
    const rows = await this.page.locator('#rightPanel table tr').all();
    const details: Record<string, string> = {};

    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length >= 2) {
        const key = (await cells[0].innerText()).replace(':', '').trim();
        const value = (await cells[1].innerText()).trim();
        details[key] = value;
      }
    }

    return details;
  }
}
