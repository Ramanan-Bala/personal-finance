import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { accountGroups, accounts, transactions } from '../../db/schema';
import {
  CreateAccountGroupInput,
  CreateAccountInput,
  UpdateAccountGroupInput,
  UpdateAccountInput,
} from './accounts.schema';

export class AccountsService {
  // Account Groups
  async createAccountGroup(userId: string, input: CreateAccountGroupInput) {
    const [group] = await db
      .insert(accountGroups)
      .values({
        userId,
        name: input.name,
        description: input.description,
      })
      .returning();

    if (!group) return null;
    const { createdAt, updatedAt, ...rest } = group;
    return rest;
  }

  async getAccountGroups(userId: string) {
    return db.query.accountGroups.findMany({
      where: eq(accountGroups.userId, userId),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        accounts: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });
  }

  async updateAccountGroup(
    userId: string,
    groupId: string,
    input: UpdateAccountGroupInput,
  ) {
    const [group] = await db
      .update(accountGroups)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(accountGroups.id, groupId), eq(accountGroups.userId, userId)),
      )
      .returning();

    if (!group) return null;
    const { createdAt, updatedAt, ...rest } = group;
    return rest;
  }

  async deleteAccountGroup(userId: string, groupId: string) {
    const group = await db.query.accountGroups.findFirst({
      where: and(
        eq(accountGroups.id, groupId),
        eq(accountGroups.userId, userId),
      ),
    });

    if (!group) return null; // Or throw

    await db
      .delete(accountGroups)
      .where(
        and(eq(accountGroups.id, groupId), eq(accountGroups.userId, userId)),
      );
    return true;
  }

  // Accounts
  async createAccount(userId: string, input: CreateAccountInput) {
    // Verify group ownership
    const group = await db.query.accountGroups.findFirst({
      where: and(
        eq(accountGroups.id, input.groupId),
        eq(accountGroups.userId, userId),
      ),
    });

    if (!group) {
      throw new Error('Account Group not found');
    }

    const [account] = await db
      .insert(accounts)
      .values({
        userId,
        groupId: input.groupId,
        name: input.name,
        openingBalance: input.openingBalance.toString(),
        description: input.description,
      })
      .returning();

    if (!account) return null;
    const { createdAt, updatedAt, ...rest } = account;
    return rest;
  }

  async getAccounts(userId: string) {
    return db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      // with: {
      //   group: {
      //     columns: {
      //       createdAt: false,
      //       updatedAt: false,
      //     },
      //   },
      // },
    });
  }

  async getAccount(userId: string, accountId: string) {
    return db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        group: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });
  }

  async updateAccount(
    userId: string,
    accountId: string,
    input: UpdateAccountInput,
  ) {
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.openingBalance) {
      updateData.openingBalance = input.openingBalance.toString();
    }

    const [account] = await db
      .update(accounts)
      .set(updateData)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
      .returning();

    if (!account) return null;
    const { createdAt, updatedAt, ...rest } = account;
    return rest;
  }

  async deleteAccount(userId: string, accountId: string) {
    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });

    if (!account) return null;

    // Check transactions
    const hasTransactions = await db.query.transactions.findFirst({
      where: eq(transactions.accountId, accountId),
    });

    if (hasTransactions) {
      throw new Error('Cannot delete account with transactions');
    }

    await db
      .delete(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
    return true;
  }
}

export const accountsService = new AccountsService();
