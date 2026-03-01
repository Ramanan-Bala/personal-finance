import { and, between, desc, eq } from 'drizzle-orm';
import { endOfDayInTimeZone, startOfDayInTimeZone } from '../../common/date-utils';
import { adjustAccountBalance, stripTimestamps } from '../../common/utils';
import { db } from '../../db';
import {
  accounts,
  categories,
  recurringTransactions,
  transactions,
  users,
} from '../../db/schema';
import { aiService } from '../ai/ai.service';
import {
  computeNextOccurrence,
  recurringTransactionsService,
} from '../recurring-transactions/recurring-transactions.service';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from './transactions.schema';

export class TransactionsService {
  async createTransaction(userId: string, input: CreateTransactionInput) {
    return db.transaction(async tx => {
      const account = await this.findUserAccount(tx, input.accountId, userId);
      if (!account) throw new Error('Account not found');

      const categoryId = await this.resolveCategory(tx, userId, input);

      if (input.type === 'TRANSFER') {
        await this.applyTransferBalances(tx, userId, input);
      }

      const balanceDelta = input.amount * (input.type === 'INCOME' ? 1 : -1);
      await adjustAccountBalance(tx, input.accountId, balanceDelta);

      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId,
          accountId: input.accountId,
          categoryId: input.type === 'TRANSFER' ? null : categoryId,
          type: input.type,
          amount: input.amount.toString(),
          transactionDate: new Date(input.transactionDate),
          notes: input.notes,
          transferToAccountId:
            input.type === 'TRANSFER' ? input.transferToAccountId : null,
        })
        .returning();

      if (input.isRecurring && input.recurringFrequency && transaction) {
        const nextOcc = computeNextOccurrence(
          new Date(input.transactionDate),
          input.recurringFrequency,
        );
        await tx.insert(recurringTransactions).values({
          userId,
          accountId: input.accountId,
          categoryId: input.type === 'TRANSFER' ? null : categoryId,
          type: input.type,
          amount: input.amount.toString(),
          notes: input.notes ?? null,
          frequency: input.recurringFrequency,
          startDate: new Date(input.transactionDate),
          endDate: input.recurringEndDate
            ? new Date(input.recurringEndDate)
            : null,
          nextOccurrence: nextOcc,
          transferToAccountId:
            input.type === 'TRANSFER'
              ? (input.transferToAccountId ?? null)
              : null,
        });
      }

      return transaction ? stripTimestamps(transaction) : null;
    });
  }

  async getTransaction(userId: string, transactionId: string) {
    return db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId),
      ),
      columns: { createdAt: false, updatedAt: false },
      with: {
        account: { columns: { createdAt: false, updatedAt: false } },
        category: { columns: { createdAt: false, updatedAt: false } },
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
      columns: { createdAt: false, updatedAt: false },
      with: { category: { columns: { createdAt: false, updatedAt: false } } },
      orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
    });
  }

  async getTransactionsByDateRange(
    userId: string,
    from: Date,
    to: Date,
    withAdditional?: boolean,
  ) {
    const timezone = await this.getUserTimezone(userId);
    const normalizedFrom = startOfDayInTimeZone(from, timezone);
    const normalizedTo = endOfDayInTimeZone(to, timezone);

    await recurringTransactionsService.materializeDueTransactions(
      userId,
      normalizedFrom,
      normalizedTo,
    );

    return db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        between(transactions.transactionDate, normalizedFrom, normalizedTo),
      ),
      columns: { createdAt: false, updatedAt: false },
      with: withAdditional
        ? {
            account: { columns: { createdAt: false, updatedAt: false } },
            category: { columns: { createdAt: false, updatedAt: false } },
            transferAccount: {
              columns: { createdAt: false, updatedAt: false },
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
      const existing = await tx.query.transactions.findFirst({
        where: and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
        with: { account: true, transferAccount: true },
      });
      if (!existing) throw new Error('Transaction not found');

      const nextType = input.type ?? existing.type;
      const nextAmount = input.amount ?? Number(existing.amount);
      const nextAccountId = input.accountId ?? existing.accountId;
      const nextTransferAccountId =
        input.transferToAccountId ?? existing.transferToAccountId;

      await this.validateUpdateInputs(
        tx,
        userId,
        nextType,
        nextAccountId,
        nextTransferAccountId,
        input,
      );

      const balanceMap = await this.buildBalanceMap(tx, [
        existing.accountId,
        nextAccountId,
        existing.transferToAccountId,
        nextTransferAccountId,
      ]);

      this.rollbackTransactionEffect(balanceMap, existing);
      this.applyTransactionEffect(
        balanceMap,
        nextType,
        nextAccountId,
        nextAmount,
        nextTransferAccountId,
      );
      await this.flushBalanceMap(tx, balanceMap);

      const isCategoryOverridden =
        input.categoryId &&
        existing.categoryId &&
        input.categoryId !== existing.categoryId;

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
      const transaction = await tx.query.transactions.findFirst({
        where: and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      });
      if (!transaction) throw new Error('Transaction not found');

      const balanceMap = await this.buildBalanceMap(tx, [
        transaction.accountId,
        transaction.transferToAccountId,
      ]);

      this.rollbackTransactionEffect(balanceMap, transaction);
      await this.flushBalanceMap(tx, balanceMap);

      await tx.delete(transactions).where(eq(transactions.id, transactionId));
      return { success: true, deletedTransaction: transaction };
    });
  }

  // --- Private helpers ---

  private async findUserAccount(tx: any, accountId: string, userId: string) {
    return tx.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });
  }

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { timezone: true },
    });
    return user?.timezone || 'UTC';
  }

  private async resolveCategory(
    tx: any,
    userId: string,
    input: CreateTransactionInput,
  ): Promise<string | null> {
    if (input.type === 'TRANSFER') return null;

    if (input.categoryId) {
      const category = await tx.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, userId),
        ),
      });
      if (!category) throw new Error('Category not found');
      return input.categoryId;
    }

    const aiEnabled = process.env.AI_CATEGORIZATION_ENABLED !== 'false';
    if (aiEnabled && input.notes) {
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
        .filter((t: any) => t.notes && t.category)
        .map((t: any) => ({
          notes: t.notes!,
          fromCategory: 'AI suggestion',
          toCategory: t.category!.name,
        }));

      const result = await aiService.categorizeTransaction(
        userId,
        input.type as 'INCOME' | 'EXPENSE',
        input.amount,
        input.notes,
        overrideContext,
      );
      return result.categoryId;
    }

    if (!aiEnabled) throw new Error('Category is required');
    return null;
  }

  private async applyTransferBalances(
    tx: any,
    userId: string,
    input: CreateTransactionInput,
  ) {
    if (!input.transferToAccountId)
      throw new Error('Target account required for transfer');
    if (input.accountId === input.transferToAccountId)
      throw new Error('Source and target account cannot be same');

    const target = await this.findUserAccount(
      tx,
      input.transferToAccountId,
      userId,
    );
    if (!target) throw new Error('Target Account not found');

    await adjustAccountBalance(tx, input.transferToAccountId, input.amount);
  }

  private async validateUpdateInputs(
    tx: any,
    userId: string,
    nextType: string,
    nextAccountId: string,
    nextTransferAccountId: string | null,
    input: UpdateTransactionInput,
  ) {
    if (nextType === 'TRANSFER') {
      if (!nextTransferAccountId)
        throw new Error('Target account required for transfer');
      if (nextAccountId === nextTransferAccountId)
        throw new Error('Source and target account cannot be same');
    }

    if (input.categoryId && nextType !== 'TRANSFER') {
      const category = await tx.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, userId),
        ),
      });
      if (!category) throw new Error('Category not found');
    }

    if (input.accountId) {
      const acc = await this.findUserAccount(tx, input.accountId, userId);
      if (!acc) throw new Error('Account not found');
    }

    if (input.transferToAccountId) {
      const acc = await this.findUserAccount(
        tx,
        input.transferToAccountId,
        userId,
      );
      if (!acc) throw new Error('Transfer account not found');
    }
  }

  private async buildBalanceMap(
    tx: any,
    accountIds: (string | null | undefined)[],
  ): Promise<Map<string, number>> {
    const ids = [...new Set(accountIds.filter(Boolean))] as string[];
    const map = new Map<string, number>();

    for (const id of ids) {
      const account = await tx.query.accounts.findFirst({
        where: eq(accounts.id, id),
      });
      if (account) map.set(id, Number(account.openingBalance));
    }

    return map;
  }

  private rollbackTransactionEffect(
    balanceMap: Map<string, number>,
    existing: any,
  ) {
    if (existing.type === 'TRANSFER') {
      this.adjustBalance(
        balanceMap,
        existing.accountId,
        Number(existing.amount),
      );
      if (existing.transferToAccountId) {
        this.adjustBalance(
          balanceMap,
          existing.transferToAccountId,
          -Number(existing.amount),
        );
      }
    } else {
      const delta =
        existing.type === 'INCOME'
          ? -Number(existing.amount)
          : Number(existing.amount);
      this.adjustBalance(balanceMap, existing.accountId, delta);
    }
  }

  private applyTransactionEffect(
    balanceMap: Map<string, number>,
    type: string,
    accountId: string,
    amount: number,
    transferAccountId?: string | null,
  ) {
    if (type === 'TRANSFER') {
      this.adjustBalance(balanceMap, accountId, -amount);
      if (transferAccountId)
        this.adjustBalance(balanceMap, transferAccountId, amount);
    } else {
      const delta = type === 'INCOME' ? amount : -amount;
      this.adjustBalance(balanceMap, accountId, delta);
    }
  }

  private adjustBalance(
    balanceMap: Map<string, number>,
    accountId: string,
    delta: number,
  ) {
    const current = balanceMap.get(accountId) ?? 0;
    balanceMap.set(accountId, current + delta);
  }

  private async flushBalanceMap(tx: any, balanceMap: Map<string, number>) {
    for (const [accountId, newBalance] of balanceMap.entries()) {
      await tx
        .update(accounts)
        .set({ openingBalance: newBalance.toString() })
        .where(eq(accounts.id, accountId));
    }
  }
}

export const transactionsService = new TransactionsService();
