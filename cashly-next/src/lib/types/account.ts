export interface Account {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  openingBalance: number;
  description?: string;
}

export interface AccountGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  accounts: Account[];
}

export interface CreateAccountDTO {
  groupId: string;
  name: string;
  openingBalance: number;
  description?: string;
}
