# ParaBank Banking Automation Framework (Assignment 2)

A robust, modular Playwright with TypeScript test automation framework implementing the **Page Object Model (POM)** pattern for the **[ParaBank Online Banking System](https://parabank.parasoft.com/)**.

---

## 🎯 Scope & Requirements Automated

This framework automates the complete banking customer journey and asserts all workflow steps and validation criteria specified in the assignment:

### Phase 1: Registration & Account Setup
- **Step 1: Register user**
  - Navigates to ParaBank registration (`/parabank/register.htm`).
  - Generates unique customer details dynamically to ensure test isolation.
  - Submits registration and verifies confirmation heading (`Welcome <username>`) and successful login state.
  - Automatically captures the initial primary account ID (`$515.50` starting balance).
- **Step 2: Open account**
  - Navigates to **Open New Account** (`/parabank/openaccount.htm`).
  - Selects account type (`SAVINGS`) funded from the primary account.
  - Submits request and validates the generated new Account ID (`expect(newAccountId).toMatch(/^\d+$/)`).

### Phase 2: Fund Transfer
- **Step 3: Capture balance before transfer** *(Challenge)*
  - Navigates to **Accounts Overview** (`/parabank/overview.htm`).
  - Dynamically extracts and logs balances for both the source (primary) and destination (new) accounts before initiating the transfer.
- **Step 4: Transfer funds**
  - Navigates to **Transfer Funds** (`/parabank/transfer.htm`).
  - Transfers the designated fund amount (`$25.00`) from the source account to the destination account.
  - Validates transfer confirmation message and account references.
- **Step 5: Capture balance after transfer** *(Challenge)*
  - Returns to **Accounts Overview** and extracts updated balances for both accounts.
  - Computes net changes and attaches a balance comparison snapshot to the test report.

### Phase 3: Post-Transfer Verification
- **Step 6: Verify transaction history**
  - 👉 **Validation Criterion 1: Transaction history reflects the transfer.**
  - Navigates to **Account Activity** for the source account and validates the debit entry (`Funds Transfer Sent: $25.00`).
  - Navigates to **Account Activity** for the destination account and validates the credit entry (`Funds Transfer Received: $25.00`).
  - Drills into the detailed transaction record (`/parabank/transaction.htm?id=...`) to verify transaction attributes.
- **Step 7: Verify account balance changed correctly**
  - 👉 **Validation Criterion 2: Account balance changes correctly after transfer.**
  - Mathematical assertion that source account balance decreased by exactly `$25.00` (`expect(sourceAfter).toBeCloseTo(sourceBefore - 25, 2)`).
  - Mathematical assertion that destination account balance increased by exactly `$25.00` (`expect(destAfter).toBeCloseTo(destBefore + 25, 2)`).
  - Mathematical assertion verifying total customer funds conservation across accounts.

---

## 📁 Project Structure

```text
Assignment_2/
├── .github/
│   └── workflows/
│       └── playwright.yml             # GitHub Actions CI workflow
├── src/
│   ├── pages/                         # Page Object Models
│   │   ├── BasePage.ts                # Shared navigation, locators & wait utilities
│   │   ├── RegisterPage.ts            # Registration form input & validation
│   │   ├── OpenAccountPage.ts         # New account opening & account ID extraction
│   │   ├── AccountsOverviewPage.ts    # Accounts table queries & balance snapshots
│   │   ├── TransferFundsPage.ts       # Fund transfer interaction & confirmation
│   │   ├── AccountActivityPage.ts     # Activity table parsing & transaction verification
│   │   └── TransactionDetailsPage.ts  # Transaction drilldown details
│   ├── fixtures/
│   │   └── testFixtures.ts            # Playwright test fixture injecting POM instances
│   ├── models/                        # TypeScript domain interfaces
│   │   ├── user.model.ts              # Registration data model
│   │   ├── account.model.ts           # Account balance & snapshot models
│   │   └── transaction.model.ts       # Transfer request & transaction record models
│   ├── data/
│   │   └── testData.ts                # Dynamic user generator & transfer configuration
│   └── utils/
│       └── config.ts                  # Base URL & timeout settings
├── tests/
│   └── parabank-banking.spec.ts       # Comprehensive end-to-end spec (Steps 1-7)
├── playwright.config.ts               # Test runner configuration (Chromium, HTML reporter, traces)
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Project scripts and dependencies
└── README.md                          # Documentation and instructions
```

---

## 🚀 How to Run the Tests

### 1. Install Dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Run Test Suite (Headless Mode)
```bash
npm test
```

### 3. Run Test Suite (Headed Mode - Browser Visible)
```bash
npm run test:headed
```

### 4. Run with Interactive Playwright UI
```bash
npm run test:ui
```

### 5. Debug Mode
```bash
npm run test:debug
```

### 6. View HTML Execution Report
```bash
npm run report
```

---

## 📊 Validation Summary Output

During execution, the test suite generates structured console tables and attaches comprehensive JSON artifacts to the Playwright HTML report:

```text
======================= FINAL VALIDATION SUMMARY =======================
1. Transaction history reflects transfer : [PASSED (Source debit recorded & Destination credit recorded for $25.00)]
2. Account balance changed correctly    : [PASSED (Source: $415.50 -> $390.50, Destination: $100.00 -> $125.00)]
Challenge: Balance before & after captured: [PASSED (Source: $415.50 -> $390.50, Dest: $100.00 -> $125.00)]
========================================================================
```
