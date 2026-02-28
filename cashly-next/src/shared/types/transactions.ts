import { Account } from "./account";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum RecurringFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY_START = "MONTHLY_START",
  MONTHLY_END = "MONTHLY_END",
  YEARLY = "YEARLY",
}

export enum RecurringStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  transactionDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  categoryId: string;
  category: Category;
  account: Account;
  transferAccount?: Account;
  transferToAccountId?: string;
  recurringTransactionId?: string | null;
  occurrenceDate?: string | Date | null;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  startDate: string;
  endDate?: string | null;
  notes?: string;
  accountId: string;
  categoryId?: string;
  account?: Account;
  category?: Category;
  transferToAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
  description?: string;
  isAiGenerated?: boolean;
}
