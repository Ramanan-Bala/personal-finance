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
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface LendDebt {
  id: string;
  userId: string;
  type: LendDebtType;
  personName: string;
  phoneNumber?: string; // Only for LEND type
  amount: number;
  dueDate?: Date;
  status: LendDebtStatus;
  notes?: string;
  payments?: LendDebtPayment[];
  outstanding?: number; // Calculated field from backend
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLendDebtInput {
  type: LendDebtType;
  personName: string;
  phoneNumber?: string; // Only for LEND type
  amount: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateLendDebtInput {
  personName?: string;
  phoneNumber?: string; // Only for LEND type
  dueDate?: string;
  notes?: string;
}
