/**
 * Models representing ParaBank accounts and balances.
 */
export type AccountType = 'CHECKING' | 'SAVINGS';

export interface AccountBalance {
  accountId: string;
  balance: number;
  balanceFormatted: string;
  availableBalance: number;
  availableFormatted: string;
}

export interface BalanceSnapshot {
  timestamp: string;
  stage: 'BEFORE_TRANSFER' | 'AFTER_TRANSFER';
  accounts: Record<string, AccountBalance>;
  totalBalance: number;
}
