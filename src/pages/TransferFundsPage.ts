import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TransferFundsRequest, TransferConfirmation } from '../models/transaction.model';

/**
 * Page Object for ParaBank Transfer Funds page (transfer.htm).
 */
export class TransferFundsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly amountInput: Locator;
  readonly fromAccountIdSelect: Locator;
  readonly toAccountIdSelect: Locator;
  readonly transferButton: Locator;
  readonly resultContainer: Locator;
  readonly resultHeading: Locator;
  readonly resultText: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('#rightPanel h1.title');
    this.amountInput = page.locator('#amount');
    this.fromAccountIdSelect = page.locator('#fromAccountId');
    this.toAccountIdSelect = page.locator('#toAccountId');
    this.transferButton = page.locator('input[value="Transfer"]');
    this.resultContainer = page.locator('#showResult');
    this.resultHeading = page.locator('#showResult h1.title');
    this.resultText = page.locator('#showResult p');
  }

  /**
   * Navigate to Transfer Funds page.
   */
  async open(): Promise<void> {
    await this.goToTransferFunds();
    await this.amountInput.waitFor({ state: 'visible' });
  }

  /**
   * Perform fund transfer from one account to another.
   */
  async transfer(request: TransferFundsRequest): Promise<TransferConfirmation> {
    await this.amountInput.waitFor({ state: 'visible' });

    // Wait until both account dropdowns are populated with options
    await this.page.waitForFunction(() => {
      const fromSel = document.querySelector('#fromAccountId') as HTMLSelectElement | null;
      const toSel = document.querySelector('#toAccountId') as HTMLSelectElement | null;
      return (
        !!fromSel &&
        fromSel.options.length > 0 &&
        !!toSel &&
        toSel.options.length > 0
      );
    }, { timeout: 15000 });

    // Enter transfer amount
    await this.amountInput.fill(request.amount.toFixed(2));

    // Select source and destination accounts
    await this.fromAccountIdSelect.selectOption(request.fromAccountId);
    await this.toAccountIdSelect.selectOption(request.toAccountId);

    // Submit transfer
    await this.transferButton.click();

    // Wait for transfer result confirmation container
    await this.resultContainer.waitFor({ state: 'visible', timeout: 15000 });
    const message = (await this.resultContainer.innerText()).trim();

    return {
      amount: request.amount,
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
      message,
    };
  }
}
