import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AccountType } from '../models/account.model';

/**
 * Page Object for ParaBank Open New Account page (openaccount.htm).
 */
export class OpenAccountPage extends BasePage {
  readonly pageHeading: Locator;
  readonly accountTypeSelect: Locator;
  readonly fromAccountIdSelect: Locator;
  readonly openAccountButton: Locator;
  readonly resultHeading: Locator;
  readonly newAccountIdLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.accountTypeSelect = page.locator('#type');
    this.fromAccountIdSelect = page.locator('#fromAccountId');
    this.openAccountButton = page.locator('input[value="Open New Account"]');
    this.resultHeading = page.locator('#openAccountResult h1.title');
    this.newAccountIdLink = page.locator('#newAccountId');
  }

  /**
   * Navigate directly or wait until on the Open Account page.
   */
  async open(): Promise<void> {
    await this.goToOpenNewAccount();
    await this.accountTypeSelect.waitFor({ state: 'visible' });
  }

  /**
   * Opens a new account and returns the newly generated Account ID.
   *
   * @param accountType 'CHECKING' (value "0") or 'SAVINGS' (value "1")
   * @param fromAccountId Optional source account to fund the opening deposit
   * @returns Generated account ID as string
   */
  async openNewAccount(accountType: AccountType = 'SAVINGS', fromAccountId?: string): Promise<string> {
    await this.accountTypeSelect.waitFor({ state: 'visible' });

    // Wait for fromAccountId dropdown to be populated via ParaBank background API
    await this.page.waitForFunction(() => {
      const el = document.querySelector('#fromAccountId') as HTMLSelectElement | null;
      return !!el && el.options.length > 0;
    }, { timeout: 10000 });

    // Select account type
    const typeValue = accountType === 'CHECKING' ? '0' : '1';
    await this.accountTypeSelect.selectOption(typeValue);

    // If source account specified, select it
    if (fromAccountId) {
      await this.fromAccountIdSelect.selectOption(fromAccountId);
    }

    // Submit open account form
    await this.openAccountButton.click();

    // Wait for confirmation and generated account link
    await this.newAccountIdLink.waitFor({ state: 'visible', timeout: 15000 });
    const newAccountId = (await this.newAccountIdLink.innerText()).trim();
    return newAccountId;
  }
}
