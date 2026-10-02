import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TransactionRecord } from '../models/transaction.model';

/**
 * Page Object for ParaBank Account Activity and Transaction History (activity.htm).
 */
export class AccountActivityPage extends BasePage {
  readonly pageHeading: Locator;
  readonly accountIdField: Locator;
  readonly accountTypeField: Locator;
  readonly balanceField: Locator;
  readonly availableBalanceField: Locator;
  readonly transactionTable: Locator;
  readonly transactionRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.accountIdField = page.locator('#accountId');
    this.accountTypeField = page.locator('#accountType');
    this.balanceField = page.locator('#balance');
    this.availableBalanceField = page.locator('#availableBalance');
    this.transactionTable = page.locator('#transactionTable');
    this.transactionRows = page.locator('#transactionTable tbody tr');
  }

  /**
   * Ensure account activity table is fully loaded.
   */
  async waitForActivityLoaded(): Promise<void> {
    await this.transactionTable.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForSelector('#transactionTable tbody tr td', { timeout: 15000 });
  }

  /**
   * Get all transaction records listed in the transaction table.
   */
  async getTransactions(): Promise<TransactionRecord[]> {
    await this.waitForActivityLoaded();
    const records: TransactionRecord[] = [];
    const rows = await this.transactionRows.all();

    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length >= 4) {
        const date = (await cells[0].innerText()).trim();
        const transaction = (await cells[1].innerText()).trim();
        const debitText = (await cells[2].innerText()).trim();
        const creditText = (await cells[3].innerText()).trim();

        const debit = debitText ? parseFloat(debitText.replace(/[^0-9.-]/g, '')) : undefined;
        const credit = creditText ? parseFloat(creditText.replace(/[^0-9.-]/g, '')) : undefined;

        records.push({
          date,
          transaction,
          debit,
          credit,
        });
      }
    }

    return records;
  }

  /**
   * Verify if a transaction matching keyword and amount exists in the history.
   */
  async hasTransaction(keyword: string, expectedAmount: number): Promise<boolean> {
    const transactions = await this.getTransactions();
    return transactions.some((t) => {
      const matchesKeyword = t.transaction.toLowerCase().includes(keyword.toLowerCase());
      const matchesAmount =
        (t.debit !== undefined && Math.abs(t.debit - expectedAmount) < 0.01) ||
        (t.credit !== undefined && Math.abs(t.credit - expectedAmount) < 0.01);
      return matchesKeyword && matchesAmount;
    });
  }

  /**
   * Click on a transaction link to navigate to Transaction Details page.
   */
  async clickTransaction(transactionText: string): Promise<void> {
    await this.waitForActivityLoaded();
    const link = this.page.locator(`#transactionTable a:has-text("${transactionText}")`).first();
    await link.click();
    await this.page.waitForURL(/.*transaction\.htm\?id=\d+/);
  }
}
