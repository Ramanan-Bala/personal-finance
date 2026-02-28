import { and, between, desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { accounts, categories, transactions } from '../../db/schema';
import { aiService } from '../ai/ai.service';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from './transactions.schema';

export class TransactionsService {
  async createTransaction(userId: string, input: CreateTransactionInput) {
    return db.transaction(async tx => {
      // 1. Verify source account
      const account = await tx.query.accounts.findFirst({
        where: and(
          eq(accounts.id, input.accountId),
          eq(accounts.userId, userId),
        ),
      });
      if (!account) throw new Error('Account not found');

      // 2. AI categorization or validate provided category
      const aiEnabled = process.env.AI_CATEGORIZATION_ENABLED !== 'false';
      let resolvedCategoryId = input.categoryId || null;
      if (input.type !== 'TRANSFER') {
        if (input.categoryId) {
          const category = await tx.query.categories.findFirst({
            where: and(
              eq(categories.id, input.categoryId),
              eq(categories.userId, userId),
            ),
          });
          if (!category) throw new Error('Category not found');
        } else if (aiEnabled && input.notes) {
          // Fetch recent overrides for AI context
          const recentOverrides = await tx.query.transactions.findMany({
            where: and(
              eq(transactions.userId, userId),
              eq(transactions.isOverridden, true),
            ),
            with: { category: true },
            orderBy: [desc(transactions.updatedAt)],
            limit: 10,
          });

          const overrideContext = recentOverrides
            .filter(t => t.notes && t.category)
            .map(t => ({
              notes: t.notes!,
              fromCategory: 'AI suggestion',
              toCategory: t.category!.name,
            }));

          const result = await aiService.categorizeTransactionWithNvidia(
            userId,
            input.type as 'INCOME' | 'EXPENSE',
            input.amount,
            input.notes,
            overrideContext,
          );
          resolvedCategoryId = result.categoryId;
        } else if (!aiEnabled && !input.categoryId) {
          throw new Error('Category is required');
        }
      }

      // 3. Handle TRANSFER
      if (input.type === 'TRANSFER' && input.transferToAccountId) {
        if (!input.transferToAccountId) {
          throw new Error('Target account required for transfer');
        }

        if (input.accountId === input.transferToAccountId) {
          throw new Error('Source and target account cannot be same');
        }

        const targetAccount = await tx.query.accounts.findFirst({
          where: and(
            eq(accounts.id, input.transferToAccountId),
            eq(accounts.userId, userId),
          ),
        });
        if (!targetAccount) throw new Error('Target Account not found');

        await tx
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

      // 4. Update source account balance
      await tx
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

      // 5. Create transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId,
          accountId: input.accountId,
          categoryId: input.type === 'TRANSFER' ? null : resolvedCategoryId,
          type: input.type,
          amount: input.amount.toString(),
          transactionDate: new Date(input.transactionDate),
          notes: input.notes,
          transferToAccountId:
            input.type === 'TRANSFER' ? input.transferToAccountId : null,
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
            transferAccount: {
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
    return db.transaction(async tx => {
      // 1. Fetch existing transaction with account details
      const existing = await tx.query.transactions.findFirst({
        where: and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
        with: {
          account: true,
          transferAccount: true,
        },
      });

      if (!existing) throw new Error('Transaction not found');

      // 2. Validate category if provided and not a transfer
      const nextType = input.type ?? existing.type;

      if (nextType !== 'TRANSFER' && input.categoryId) {
        const category = await tx.query.categories.findFirst({
          where: and(
            eq(categories.id, input.categoryId),
            eq(categories.userId, userId),
          ),
        });
        if (!category) throw new Error('Category not found');
      }

      // 3. Determine next values
      const nextAmount = input.amount ?? Number(existing.amount);
      const nextAccountId = input.accountId ?? existing.accountId;
      const nextTransferAccountId =
        input.transferToAccountId ?? existing.transferToAccountId;

      // 4. Validate transfer constraints
      if (nextType === 'TRANSFER') {
        if (!nextTransferAccountId) {
          throw new Error('Target account required for transfer');
        }
        if (nextAccountId === nextTransferAccountId) {
          throw new Error('Source and target account cannot be same');
        }
      }

      // 5. Validate accounts exist if changed
      if (input.accountId && input.accountId !== existing.accountId) {
        const newAccount = await tx.query.accounts.findFirst({
          where: and(
            eq(accounts.id, input.accountId),
            eq(accounts.userId, userId),
          ),
        });
        if (!newAccount) throw new Error('Account not found');
      }

      if (
        input.transferToAccountId &&
        input.transferToAccountId !== existing.transferToAccountId
      ) {
        const newTransferAccount = await tx.query.accounts.findFirst({
          where: and(
            eq(accounts.id, input.transferToAccountId),
            eq(accounts.userId, userId),
          ),
        });
        if (!newTransferAccount) throw new Error('Transfer account not found');
      }

      // 6. Fetch current account balances
      const accountsToFetch = new Set(
        [
          existing.accountId,
          nextAccountId,
          existing.transferToAccountId,
          nextTransferAccountId,
        ].filter(Boolean) as string[],
      );

      const accountBalances = new Map<string, number>();

      for (const accountId of accountsToFetch) {
        const account = await tx.query.accounts.findFirst({
          where: eq(accounts.id, accountId),
        });
        if (account) {
          accountBalances.set(accountId, Number(account.openingBalance));
        }
      }

      // 7. Helper function to update balance
      const updateBalance = (accountId: string, delta: number) => {
        const currentBalance = accountBalances.get(accountId) ?? 0;
        const newBalance = currentBalance + delta;
        accountBalances.set(accountId, newBalance);
      };

      // 8. Rollback OLD transaction effect
      if (existing.type === 'TRANSFER') {
        // Reverse: add back to source (it was debited)
        updateBalance(existing.accountId, Number(existing.amount));

        // Reverse: subtract from target (it was credited)
        if (existing.transferToAccountId) {
          updateBalance(existing.transferToAccountId, -Number(existing.amount));
        }
      } else {
        // INCOME: reverse by subtracting
        // EXPENSE: reverse by adding back
        const rollbackDelta =
          existing.type === 'INCOME'
            ? -Number(existing.amount)
            : Number(existing.amount);

        updateBalance(existing.accountId, rollbackDelta);
      }

      // 9. Apply NEW transaction effect
      if (nextType === 'TRANSFER') {
        // Debit source account
        updateBalance(nextAccountId, -nextAmount);

        // Credit target account
        updateBalance(nextTransferAccountId!, nextAmount);
      } else {
        // INCOME: add to account
        // EXPENSE: subtract from account
        const delta = nextType === 'INCOME' ? nextAmount : -nextAmount;
        updateBalance(nextAccountId, delta);
      }

      // 10. Write all balance updates to database
      for (const [accountId, newBalance] of accountBalances.entries()) {
        await tx
          .update(accounts)
          .set({
            openingBalance: newBalance.toString(),
          })
          .where(eq(accounts.id, accountId));
      }

      // 11. Detect category override
      const isCategoryOverridden =
        input.categoryId &&
        existing.categoryId &&
        input.categoryId !== existing.categoryId;

      // 12. Update transaction row
      const [updated] = await tx
        .update(transactions)
        .set({
          ...input,
          amount: input.amount ? input.amount.toString() : undefined,
          transactionDate: input.transactionDate
            ? new Date(input.transactionDate)
            : undefined,
          categoryId:
            nextType === 'TRANSFER'
              ? null
              : (input.categoryId ?? existing.categoryId),
          transferToAccountId:
            nextType === 'TRANSFER' ? nextTransferAccountId : null,
          isOverridden: isCategoryOverridden ? true : existing.isOverridden,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId))
        .returning();

      return updated;
    });
  }

  async deleteTransaction(userId: string, transactionId: string) {
    return db.transaction(async tx => {
      // 1. Fetch the transaction with account details
      const transaction = await tx.query.transactions.findFirst({
        where: and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      });

      if (!transaction) throw new Error('Transaction not found');

      // 2. Fetch current account balances
      const accountsToUpdate = new Map<string, number>();

      // Get source account balance
      const sourceAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, transaction.accountId),
      });

      if (!sourceAccount) throw new Error('Source account not found');

      accountsToUpdate.set(
        transaction.accountId,
        Number(sourceAccount.openingBalance),
      );

      // Get target account balance if transfer
      if (transaction.type === 'TRANSFER' && transaction.transferToAccountId) {
        const targetAccount = await tx.query.accounts.findFirst({
          where: eq(accounts.id, transaction.transferToAccountId),
        });

        if (!targetAccount) throw new Error('Target account not found');

        accountsToUpdate.set(
          transaction.transferToAccountId,
          Number(targetAccount.openingBalance),
        );
      }

      // 3. Reverse the transaction effect on account balances
      if (transaction.type === 'TRANSFER') {
        // Reverse transfer: add back to source, subtract from target
        const sourceBalance = accountsToUpdate.get(transaction.accountId)!;
        accountsToUpdate.set(
          transaction.accountId,
          sourceBalance + Number(transaction.amount),
        );

        if (transaction.transferToAccountId) {
          const targetBalance = accountsToUpdate.get(
            transaction.transferToAccountId,
          )!;
          accountsToUpdate.set(
            transaction.transferToAccountId,
            targetBalance - Number(transaction.amount),
          );
        }
      } else {
        // Reverse INCOME or EXPENSE
        const reversalDelta =
          transaction.type === 'INCOME'
            ? -Number(transaction.amount) // Remove the income
            : Number(transaction.amount); // Add back the expense

        const currentBalance = accountsToUpdate.get(transaction.accountId)!;
        accountsToUpdate.set(
          transaction.accountId,
          currentBalance + reversalDelta,
        );
      }

      // 4. Update all affected account balances
      for (const [accountId, newBalance] of accountsToUpdate.entries()) {
        await tx
          .update(accounts)
          .set({
            openingBalance: newBalance.toString(),
          })
          .where(eq(accounts.id, accountId));
      }

      // 5. Delete the transaction
      await tx.delete(transactions).where(eq(transactions.id, transactionId));

      return { success: true, deletedTransaction: transaction };
    });
  }
}

export const transactionsService = new TransactionsService();
