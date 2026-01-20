import { Injectable } from '@nestjs/common';
import { Account, AccountGroup, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaClient) {}

  // Account Group Operations
  async createAccountGroup(
    userId: string,
    name: string,
    description?: string,
  ): Promise<AccountGroup> {
    return this.prisma.accountGroup.create({
      data: {
        userId,
        name,
        description,
      },
    });
  }

  async findAccountGroupById(
    userId: string,
    groupId: string,
  ): Promise<AccountGroup | null> {
    return this.prisma.accountGroup.findFirst({
      where: {
        id: groupId,
        userId,
      },
    });
  }

  async findAccountGroupsByUserId(userId: string): Promise<AccountGroup[]> {
    return this.prisma.accountGroup.findMany({
      where: { userId },
      include: { accounts: true },
    });
  }

  async updateAccountGroup(
    _userId: string,
    groupId: string,
    data: Partial<AccountGroup>,
  ): Promise<AccountGroup> {
    return this.prisma.accountGroup.update({
      where: { id: groupId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteAccountGroup(_userId: string, groupId: string): Promise<void> {
    await this.prisma.accountGroup.delete({
      where: { id: groupId },
    });
  }

  // Account Operations
  async createAccount(
    userId: string,
    groupId: string,
    name: string,
    openingBalance: Decimal,
    description?: string,
  ): Promise<Account> {
    return this.prisma.account.create({
      data: {
        userId,
        groupId,
        name,
        openingBalance,
        description,
      },
    });
  }

  async findAccountById(
    userId: string,
    accountId: string,
  ): Promise<Account | null> {
    return this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });
  }

  async findAccountsByUserId(userId: string): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }

  async findAccountsByGroupId(
    userId: string,
    groupId: string,
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: {
        userId,
        groupId,
      },
    });
  }

  async updateAccount(
    _userId: string,
    accountId: string,
    data: Partial<Account>,
  ): Promise<Account> {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteAccount(_userId: string, accountId: string): Promise<void> {
    await this.prisma.account.delete({
      where: { id: accountId },
    });
  }

  async hasTransactions(accountId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: { accountId },
    });
    return count > 0;
  }
}
