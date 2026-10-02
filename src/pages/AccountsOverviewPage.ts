import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AccountBalance, BalanceSnapshot } from '../models/account.model';

/**
 * Page Object for ParaBank Accounts Overview (overview.htm).
 * Handles account table queries, balance extraction, and snapshot capturing.
 */
export class AccountsOverviewPage extends BasePage {
  readonly pageHeading: Locator;
  readonly accountTable: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.accountTable = page.locator('#accountTable');
    this.tableRows = page.locator('#accountTable tbody tr');
  }

  /**
   * Navigate to Accounts Overview and ensure table rows are fully rendered.
   */
  async open(): Promise<void> {
    await this.goToAccountsOverview();
    await this.waitForLoaded();
  }

  /**
   * Wait for accounts table data to be loaded dynamically.
   */
  async waitForLoaded(): Promise<void> {
    await this.accountTable.waitFor({ state: 'visible', timeout: 15000 });
    // Wait until at least one account link row is visible
    await this.page.waitForSelector('#accountTable tbody tr td a', { timeout: 15000 });
    // Wait for balance dollar values to be populated
    await this.page.waitForFunction(() => {
      const cells = document.querySelectorAll('#accountTable tbody tr td');
      return Array.from(cells).some((td) => td.textContent?.includes('$'));
    }, { timeout: 15000 });
  }

  /**
   * Retrieve all accounts and their respective balances from the overview table.
   */
  async getAllAccountBalances(): Promise<Record<string, AccountBalance>> {
    await this.waitForLoaded();
    const result: Record<string, AccountBalance> = {};
    const rows = await this.tableRows.all();

    for (const row of rows) {
      const link = row.locator('td a').first();
      const count = await link.count();
      if (count > 0) {
        const accountId = (await link.innerText()).trim();
        const cells = await row.locator('td').all();
        if (cells.length >= 3) {
          const balanceFormatted = (await cells[1].innerText()).trim();
          const availableFormatted = (await cells[2].innerText()).trim();
          const balance = parseFloat(balanceFormatted.replace(/[^0-9.-]/g, ''));
          const availableBalance = parseFloat(availableFormatted.replace(/[^0-9.-]/g, ''));

          result[accountId] = {
            accountId,
            balance,
            balanceFormatted,
            availableBalance,
            availableFormatted,
          };
        }
      }
    }

    return result;
  }

  /**
   * Retrieve the balance for a specific account.
   */
  async getBalanceForAccount(accountId: string): Promise<number> {
    const balances = await this.getAllAccountBalances();
    if (!(accountId in balances)) {
      throw new Error(`Account ${accountId} not found in Accounts Overview table.`);
    }
    return balances[accountId].balance;
  }

  /**
   * Retrieve primary (first listed) account ID.
   */
  async getPrimaryAccountId(): Promise<string> {
    await this.waitForLoaded();
    const firstLink = this.page.locator('#accountTable tbody tr td a').first();
    await firstLink.waitFor({ state: 'visible' });
    return (await firstLink.innerText()).trim();
  }

  /**
   * Captures a structured snapshot of balances before or after transfer.
   */
  async captureSnapshot(stage: 'BEFORE_TRANSFER' | 'AFTER_TRANSFER'): Promise<BalanceSnapshot> {
    const accounts = await this.getAllAccountBalances();
    const totalBalance = Object.values(accounts).reduce((sum, acc) => sum + acc.balance, 0);

    return {
      timestamp: new Date().toISOString(),
      stage,
      accounts,
      totalBalance,
    };
  }

  /**
   * Click on an account number to navigate to its Account Activity page.
   */
  async clickAccount(accountId: string): Promise<void> {
    await this.waitForLoaded();
    const link = this.page.locator(`#accountTable a:has-text("${accountId}")`);
    await link.click();
    await this.page.waitForURL(new RegExp(`.*activity\\.htm\\?id=${accountId}`));
  }
}
