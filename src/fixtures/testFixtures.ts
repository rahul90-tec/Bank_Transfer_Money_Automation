import { test as baseTest, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { AccountActivityPage } from '../pages/AccountActivityPage';
import { TransactionDetailsPage } from '../pages/TransactionDetailsPage';

/**
 * Fixture types containing all Page Objects required for ParaBank flows.
 */
export type TestPages = {
  registerPage: RegisterPage;
  openAccountPage: OpenAccountPage;
  overviewPage: AccountsOverviewPage;
  transferPage: TransferFundsPage;
  activityPage: AccountActivityPage;
  transactionDetailsPage: TransactionDetailsPage;
};

/**
 * Custom Playwright test fixture injecting Page Objects.
 */
export const test = baseTest.extend<TestPages>({
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  openAccountPage: async ({ page }, use) => {
    await use(new OpenAccountPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },
  transferPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },
  activityPage: async ({ page }, use) => {
    await use(new AccountActivityPage(page));
  },
  transactionDetailsPage: async ({ page }, use) => {
    await use(new TransactionDetailsPage(page));
  },
});

export { expect };
