/**
 * Models representing ParaBank fund transfers and transaction records.
 */
export interface TransferFundsRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferConfirmation {
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  message: string;
}

export interface TransactionRecord {
  date: string;
  transaction: string;
  debit?: number;
  credit?: number;
}
