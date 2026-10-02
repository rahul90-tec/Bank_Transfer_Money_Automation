import { test, expect } from '../src/fixtures/testFixtures';
import { generateTestUserData, testConfigData } from '../src/data/testData';
import { BalanceSnapshot } from '../src/models/account.model';
import { TransferConfirmation } from '../src/models/transaction.model';

test.describe('ParaBank Automation: Account Setup, Fund Transfer & Post-Transfer Verification', () => {
  test('Complete Flow: Register User -> Open Account -> Fund Transfer -> Verification', async ({
    registerPage,
    openAccountPage,
    overviewPage,
    transferPage,
    activityPage,
    transactionDetailsPage,
  }) => {
    // Execution state variables
    const userData = generateTestUserData();
    let primaryAccountId = '';
    let newAccountId = '';
    let snapshotBefore: BalanceSnapshot;
    let snapshotAfter: BalanceSnapshot;
    let transferResult: TransferConfirmation;
    const transferAmount = testConfigData.transferAmount;

    // Track status for final validation summary
    const validationSummary = {
      v1_transactionHistory: '',
      v2_balanceChangedCorrectly: '',
      challenge_capturedBalances: '',
    };

    // =========================================================================
    // Phase 1: Registration & Account Setup (Steps 1 - 2)
    // =========================================================================
    await test.step('Phase 1: Registration & Account Setup (Steps 1 & 2)', async () => {
      // -----------------------------------------------------------------------
      // Step 1: Register user
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log(`[STEP 1] Registering New User: ${userData.username}`);
      console.log('============================================================');

      await registerPage.open();
      await registerPage.registerUser(userData);

      const welcomeText = await registerPage.getWelcomeText();
      const successMessage = await registerPage.getSuccessMessageText();

      expect(welcomeText).toContain(`Welcome ${userData.username}`);
      expect(successMessage).toContain('Your account was created successfully. You are now logged in.');

      console.log(`✓ User registration confirmed for: ${userData.username}`);

      // Discover primary account created upon registration
      await overviewPage.open();
      primaryAccountId = await overviewPage.getPrimaryAccountId();
      expect(primaryAccountId, 'Primary account should be generated').toMatch(/^\d+$/);
      console.log(`✓ Initial primary account ID generated: ${primaryAccountId}`);

      // -----------------------------------------------------------------------
      // Step 2: Open account
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log(`[STEP 2] Opening New Account (${testConfigData.newAccountType})`);
      console.log('============================================================');

      await openAccountPage.open();
      newAccountId = await openAccountPage.openNewAccount(testConfigData.newAccountType, primaryAccountId);

      expect(newAccountId, 'New account ID should be generated and non-empty').toBeTruthy();
      expect(newAccountId, 'New account ID should be a numeric string').toMatch(/^\d+$/);
      expect(newAccountId, 'New account should have a different ID than primary').not.toBe(primaryAccountId);

      console.log(`✓ New account successfully opened with ID: ${newAccountId}`);

      await test.info().attach('Phase 1 - Account Setup Info', {
        body: JSON.stringify(
          {
            username: userData.username,
            primaryAccountId,
            newAccountId,
            newAccountType: testConfigData.newAccountType,
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
    });

    // =========================================================================
    // Phase 2: Fund Transfer (Steps 3 - 5)
    // =========================================================================
    await test.step('Phase 2: Fund Transfer (Steps 3 - 5)', async () => {
      // -----------------------------------------------------------------------
      // Step 3: Capture balance before transfer (Challenge)
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log('[STEP 3] Capturing Balances BEFORE Transfer');
      console.log('============================================================');

      await overviewPage.open();
      snapshotBefore = await overviewPage.captureSnapshot('BEFORE_TRANSFER');

      const primaryBefore = snapshotBefore.accounts[primaryAccountId]?.balance ?? 0;
      const newAccBefore = snapshotBefore.accounts[newAccountId]?.balance ?? 0;

      console.table([
        {
          'Account Role': 'Source (Primary)',
          'Account Number': primaryAccountId,
          'Balance Before': `$${primaryBefore.toFixed(2)}`,
        },
        {
          'Account Role': 'Destination (New)',
          'Account Number': newAccountId,
          'Balance Before': `$${newAccBefore.toFixed(2)}`,
        },
      ]);

      expect(primaryBefore, 'Primary account must have sufficient funds').toBeGreaterThan(transferAmount);

      await test.info().attach('Step 3 - Balance Snapshot Before Transfer', {
        body: JSON.stringify(snapshotBefore, null, 2),
        contentType: 'application/json',
      });

      // -----------------------------------------------------------------------
      // Step 4: Transfer funds
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log(`[STEP 4] Transferring $${transferAmount.toFixed(2)} from ${primaryAccountId} to ${newAccountId}`);
      console.log('============================================================');

      await transferPage.open();
      transferResult = await transferPage.transfer({
        fromAccountId: primaryAccountId,
        toAccountId: newAccountId,
        amount: transferAmount,
      });

      expect(transferResult.message).toContain('Transfer Complete!');
      expect(transferResult.message).toContain(`$${transferAmount.toFixed(2)}`);
      expect(transferResult.message).toContain(primaryAccountId);
      expect(transferResult.message).toContain(newAccountId);

      console.log(`✓ Transfer completed successfully: ${transferResult.message.replace(/\s+/g, ' ')}`);

      await test.info().attach('Step 4 - Transfer Confirmation', {
        body: JSON.stringify(transferResult, null, 2),
        contentType: 'application/json',
      });

      // -----------------------------------------------------------------------
      // Step 5: Capture balance after transfer (Challenge)
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log('[STEP 5] Capturing Balances AFTER Transfer');
      console.log('============================================================');

      await overviewPage.open();
      snapshotAfter = await overviewPage.captureSnapshot('AFTER_TRANSFER');

      const primaryAfter = snapshotAfter.accounts[primaryAccountId]?.balance ?? 0;
      const newAccAfter = snapshotAfter.accounts[newAccountId]?.balance ?? 0;

      console.table([
        {
          'Account Role': 'Source (Primary)',
          'Account Number': primaryAccountId,
          'Balance Before': `$${primaryBefore.toFixed(2)}`,
          'Balance After': `$${primaryAfter.toFixed(2)}`,
          'Net Change': `$${(primaryAfter - primaryBefore).toFixed(2)}`,
        },
        {
          'Account Role': 'Destination (New)',
          'Account Number': newAccountId,
          'Balance Before': `$${newAccBefore.toFixed(2)}`,
          'Balance After': `$${newAccAfter.toFixed(2)}`,
          'Net Change': `+$${(newAccAfter - newAccBefore).toFixed(2)}`,
        },
      ]);

      validationSummary.challenge_capturedBalances = `PASSED (Source: $${primaryBefore.toFixed(2)} -> $${primaryAfter.toFixed(2)}, Dest: $${newAccBefore.toFixed(2)} -> $${newAccAfter.toFixed(2)})`;

      await test.info().attach('Step 5 - Balance Snapshot After Transfer', {
        body: JSON.stringify(snapshotAfter, null, 2),
        contentType: 'application/json',
      });
    });

    // =========================================================================
    // Phase 3: Post-Transfer Verification (Steps 6 & 7)
    // =========================================================================
    await test.step('Phase 3: Post-Transfer Verification (Steps 6 & 7)', async () => {
      // -----------------------------------------------------------------------
      // Step 6: Verify transaction history
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log('[STEP 6] Verifying Transaction History');
      console.log('============================================================');

      // 1. Check Source Account Activity (Debit / Sent)
      await overviewPage.open();
      await overviewPage.clickAccount(primaryAccountId);
      await activityPage.waitForActivityLoaded();

      const sourceTransactions = await activityPage.getTransactions();
      console.log(`\nSource Account (${primaryAccountId}) Transaction Records:`);
      console.table(sourceTransactions);

      const sourceHasTransfer = await activityPage.hasTransaction('Funds Transfer Sent', transferAmount);

      // 2. Check Destination Account Activity (Credit / Received)
      await overviewPage.open();
      await overviewPage.clickAccount(newAccountId);
      await activityPage.waitForActivityLoaded();

      const destTransactions = await activityPage.getTransactions();
      console.log(`\nDestination Account (${newAccountId}) Transaction Records:`);
      console.table(destTransactions);

      const destHasTransfer = await activityPage.hasTransaction('Funds Transfer Received', transferAmount);

      // Inspect transaction details modal/page for destination account
      await activityPage.clickTransaction('Funds Transfer Received');
      const details = await transactionDetailsPage.getDetails();
      console.log('\nDetailed Transaction Record:', details);

      // -----------------------------------------------------------------------
      // Validation Criterion 1: Transaction history reflects the transfer
      // -----------------------------------------------------------------------
      expect(
        sourceHasTransfer,
        `Validation Criterion 1: Source account (${primaryAccountId}) reflects debit of $${transferAmount.toFixed(2)}`
      ).toBeTruthy();

      expect(
        destHasTransfer,
        `Validation Criterion 1: Destination account (${newAccountId}) reflects credit of $${transferAmount.toFixed(2)}`
      ).toBeTruthy();

      validationSummary.v1_transactionHistory = `PASSED (Source debit recorded & Destination credit recorded for $${transferAmount.toFixed(2)})`;
      console.log('------------------------------------------------------------');
      console.log('[VALIDATION 1: PASSED] Transaction history reflects the transfer');
      console.log(`  - Source Account Debit  : Verified ($${transferAmount.toFixed(2)} Sent)`);
      console.log(`  - Destination Account Credit: Verified ($${transferAmount.toFixed(2)} Received)`);
      console.log('------------------------------------------------------------\n');

      // -----------------------------------------------------------------------
      // Step 7: Verify account balance changed correctly
      // -----------------------------------------------------------------------
      console.log('\n============================================================');
      console.log('[STEP 7] Verifying Account Balance Changes Correctly');
      console.log('============================================================');

      const primaryBefore = snapshotBefore.accounts[primaryAccountId]?.balance ?? 0;
      const primaryAfter = snapshotAfter.accounts[primaryAccountId]?.balance ?? 0;
      const newAccBefore = snapshotBefore.accounts[newAccountId]?.balance ?? 0;
      const newAccAfter = snapshotAfter.accounts[newAccountId]?.balance ?? 0;

      const expectedPrimaryAfter = primaryBefore - transferAmount;
      const expectedNewAccAfter = newAccBefore + transferAmount;

      // -----------------------------------------------------------------------
      // Validation Criterion 2: Account balance changes correctly after transfer
      // -----------------------------------------------------------------------
      expect(
        primaryAfter,
        `Validation Criterion 2: Source account balance decreased by transfer amount ($${transferAmount})`
      ).toBeCloseTo(expectedPrimaryAfter, 2);

      expect(
        newAccAfter,
        `Validation Criterion 2: Destination account balance increased by transfer amount ($${transferAmount})`
      ).toBeCloseTo(expectedNewAccAfter, 2);

      // Verify overall balance conservation across customer accounts
      expect(
        snapshotAfter.totalBalance,
        'Validation Criterion 2: Total customer balance across all accounts is conserved'
      ).toBeCloseTo(snapshotBefore.totalBalance, 2);

      validationSummary.v2_balanceChangedCorrectly = `PASSED (Source: $${primaryBefore.toFixed(2)} -> $${primaryAfter.toFixed(2)}, Destination: $${newAccBefore.toFixed(2)} -> $${newAccAfter.toFixed(2)})`;
      console.log('------------------------------------------------------------');
      console.log('[VALIDATION 2: PASSED] Account balance changed correctly after transfer');
      console.log(`  - Expected Source Balance : $${expectedPrimaryAfter.toFixed(2)} | Actual: $${primaryAfter.toFixed(2)}`);
      console.log(`  - Expected Dest Balance   : $${expectedNewAccAfter.toFixed(2)} | Actual: $${newAccAfter.toFixed(2)}`);
      console.log(`  - Total Balance Conserved : $${snapshotBefore.totalBalance.toFixed(2)} === $${snapshotAfter.totalBalance.toFixed(2)}`);
      console.log('------------------------------------------------------------\n');

      // =======================================================================
      // FINAL VALIDATION SUMMARY TABLE
      // =======================================================================
      console.log('======================= FINAL VALIDATION SUMMARY =======================');
      console.log(`1. Transaction history reflects transfer : [${validationSummary.v1_transactionHistory}]`);
      console.log(`2. Account balance changed correctly    : [${validationSummary.v2_balanceChangedCorrectly}]`);
      console.log(`Challenge: Balance before & after captured: [${validationSummary.challenge_capturedBalances}]`);
      console.log('========================================================================\n');

      await test.info().attach('Final Validations Summary', {
        body: JSON.stringify(validationSummary, null, 2),
        contentType: 'application/json',
      });
    });
  });
});
