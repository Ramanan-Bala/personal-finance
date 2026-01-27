import { Account } from "./account";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
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
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
  description?: string;
}
