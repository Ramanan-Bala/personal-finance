export enum LendDebtType {
  LEND = "LEND",
  DEBT = "DEBT",
}

export enum LendDebtStatus {
  OPEN = "OPEN",
  SETTLED = "SETTLED",
}

export interface LendDebtPayment {
  id: string;
  userId: string;
  lendDebtId: string;
  accountId: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface LendDebt {
  id: string;
  userId: string;
  accountId: string;
  type: LendDebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  dueDate?: Date;
  status: LendDebtStatus;
  notes?: string;
  payments?: LendDebtPayment[];
  outstanding?: number;
  account?: { id: string; name: string; openingBalance: number };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLendDebtInput {
  type: LendDebtType;
  accountId: string;
  personName: string;
  phoneNumber?: string;
  amount: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateLendDebtInput {
  accountId?: string;
  type?: LendDebtType;
  personName?: string;
  phoneNumber?: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}
