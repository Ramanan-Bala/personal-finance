import { and, between, eq } from 'drizzle-orm';
import { db } from '../../db';
import { accounts, categories, transactions } from '../../db/schema';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from './transactions.schema';

export class TransactionsService {
  async createTransaction(userId: string, input: CreateTransactionInput) {
    // Verify account exists
    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
    });

    if (!account) throw new Error('Account not found');

    await db
      .update(accounts)
      .set({
        openingBalance: (
          Number(account.openingBalance) +
          Number(input.amount * (input.type === 'INCOME' ? 1 : -1))
        ).toString(),
      })
      .where(
        and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
      );

    // Verify category if provided
    if (input.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, userId),
        ),
      });
      if (!category) throw new Error('Category not found');
    }

    // Verify target account for transfers
    if (input.type === 'TRANSFER' && input.transferToAccountId) {
      const targetAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.id, input.transferToAccountId),
          eq(accounts.userId, userId),
        ),
      });

      if (!targetAccount) throw new Error('Target Account not found');
      await db
        .update(accounts)
        .set({
          openingBalance: targetAccount.openingBalance + input.amount,
        })
        .where(
          and(
            eq(accounts.id, input.transferToAccountId),
            eq(accounts.userId, userId),
          ),
        );
    }

    return db.transaction(async tx => {
      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId,
          accountId: input.accountId,
          categoryId: input.categoryId,
          type: input.type,
          amount: input.amount.toString(),
          transactionDate: new Date(input.transactionDate),
          notes: input.notes,
          transferToAccountId: input.transferToAccountId,
        })
        .returning();

      if (!transaction) return null;
      const { createdAt, updatedAt, ...rest } = transaction;
      return rest;
    });
  }

  async getTransaction(userId: string, transactionId: string) {
    return db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId),
      ),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        account: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
        category: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });
  }

  async getTransactionsByAccount(userId: string, accountId: string) {
    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });
    if (!account) throw new Error('Account not found');

    return db.query.transactions.findMany({
      where: and(
        eq(transactions.accountId, accountId),
        eq(transactions.userId, userId),
      ),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        category: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
      orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
    });
  }

  async getTransactionsByDateRange(
    userId: string,
    from: Date,
    to: Date,
    withAdditional?: boolean,
  ) {
    return db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        between(transactions.transactionDate, from, to),
      ),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: withAdditional
        ? {
            account: {
              columns: {
                createdAt: false,
                updatedAt: false,
              },
            },
            category: {
              columns: {
                createdAt: false,
                updatedAt: false,
              },
            },
          }
        : {},
      orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
    });
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput,
  ) {
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId),
      ),
    });

    if (!transaction) throw new Error('Transaction not found');

    if (input.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, userId),
        ),
      });
      if (!category) throw new Error('Category not found');
    }

    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.amount) updateData.amount = input.amount.toString();
    if (input.transactionDate)
      updateData.transactionDate = new Date(input.transactionDate);

    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      )
      .returning();

    if (!updatedTransaction) return null;
    const { createdAt, updatedAt, ...rest } = updatedTransaction;
    return rest;
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId),
      ),
    });

    if (!transaction) throw new Error('Transaction not found');

    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      );
    return true;
  }
}

export const transactionsService = new TransactionsService();
