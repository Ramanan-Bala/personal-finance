import { and, eq, gte, isNull, lte, or } from 'drizzle-orm';
import {
  dayStampInTimeZone,
  endOfDayInTimeZone,
  startOfDayInTimeZone,
} from '../../common/date-utils';
import { adjustAccountBalance, stripTimestamps } from '../../common/utils';
import { db } from '../../db';
import {
  accounts,
  categories,
  recurringTransactions,
  transactions,
  users,
} from '../../db/schema';
import {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from './recurring-transactions.schema';

export function computeNextOccurrence(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY_START':
      next.setMonth(next.getMonth() + 1, 1);
      break;
    case 'MONTHLY_END':
      next.setMonth(next.getMonth() + 2, 0);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export class RecurringTransactionsService {
  async listRules(userId: string) {
    return db.query.recurringTransactions.findMany({
      where: eq(recurringTransactions.userId, userId),
      columns: { createdAt: false, updatedAt: false },
      orderBy: (rt, { desc }) => [desc(rt.startDate)],
    });
  }

  async createRule(userId: string, input: CreateRecurringTransactionInput) {
    return db.transaction(async tx => {
      await this.validateRuleInput(tx, userId, input);

      const startDate = new Date(input.startDate);
      const [rule] = await tx
        .insert(recurringTransactions)
        .values({
          userId,
          accountId: input.accountId,
          categoryId:
            input.type === 'TRANSFER' ? null : (input.categoryId ?? null),
          transferToAccountId:
            input.type === 'TRANSFER'
              ? (input.transferToAccountId ?? null)
              : null,
          type: input.type,
          amount: input.amount.toString(),
          notes: input.notes ?? null,
          frequency: input.frequency,
          startDate,
          endDate: input.endDate ? new Date(input.endDate) : null,
          nextOccurrence: startDate,
        })
        .returning();

      return rule ? stripTimestamps(rule) : null;
    });
  }

  async updateRule(
    userId: string,
    ruleId: string,
    input: UpdateRecurringTransactionInput,
  ) {
    return db.transaction(async tx => {
      const existing = await tx.query.recurringTransactions.findFirst({
        where: and(
          eq(recurringTransactions.id, ruleId),
          eq(recurringTransactions.userId, userId),
        ),
      });
      if (!existing) throw new Error('Recurring rule not found');

      const nextType = input.type ?? existing.type;
      const nextAccountId = input.accountId ?? existing.accountId;
      const nextTransferToAccountId =
        input.transferToAccountId !== undefined
          ? input.transferToAccountId
          : existing.transferToAccountId;
      const nextCategoryId =
        input.categoryId !== undefined ? input.categoryId : existing.categoryId;

      await this.validateRuleInput(tx, userId, {
        accountId: nextAccountId,
        categoryId: nextCategoryId ?? undefined,
        transferToAccountId: nextTransferToAccountId ?? undefined,
        type: nextType,
        startDate: existing.startDate.toISOString(),
        endDate:
          input.endDate === undefined
            ? (existing.endDate?.toISOString() ?? null)
            : input.endDate,
      });

      const [updated] = await tx
        .update(recurringTransactions)
        .set({
          ...(input.accountId && { accountId: input.accountId }),
          ...(input.type && { type: input.type }),
          ...(input.amount && { amount: input.amount.toString() }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.frequency && { frequency: input.frequency }),
          ...(input.status && { status: input.status }),
          ...(input.endDate !== undefined && {
            endDate: input.endDate ? new Date(input.endDate) : null,
          }),
          ...(input.categoryId !== undefined && {
            categoryId: input.categoryId,
          }),
          ...(input.transferToAccountId !== undefined && {
            transferToAccountId: input.transferToAccountId,
          }),
          updatedAt: new Date(),
        })
        .where(eq(recurringTransactions.id, ruleId))
        .returning();

      return updated ? stripTimestamps(updated) : null;
    });
  }

  async materializeDueTransactions(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<{ generatedCount: number }> {
    return db.transaction(async tx => {
      const timezone = await this.getUserTimezone(tx, userId);
      const normalizedFrom = startOfDayInTimeZone(from, timezone);
      const requestedTo = endOfDayInTimeZone(to, timezone);
      const todayUtcEnd = endOfDayInTimeZone(new Date(), timezone);
      const effectiveTo = requestedTo < todayUtcEnd ? requestedTo : todayUtcEnd;

      if (normalizedFrom > effectiveTo) {
        return { generatedCount: 0 };
      }

      const rules = await tx.query.recurringTransactions.findMany({
        where: and(
          eq(recurringTransactions.userId, userId),
          eq(recurringTransactions.status, 'ACTIVE'),
          lte(recurringTransactions.nextOccurrence, effectiveTo),
          or(
            isNull(recurringTransactions.endDate),
            gte(recurringTransactions.endDate, normalizedFrom),
          ),
        ),
      });

      let generatedCount = 0;

      for (const rule of rules) {
        const count = await this.materializeRule(
          tx,
          userId,
          rule,
          normalizedFrom,
          effectiveTo,
          timezone,
        );
        generatedCount += count;
      }

      return { generatedCount };
    });
  }

  private async materializeRule(
    tx: any,
    userId: string,
    rule: any,
    from: Date,
    to: Date,
    timezone: string,
  ): Promise<number> {
    let occurrence = new Date(rule.nextOccurrence);
    let count = 0;
    const fromDay = dayStampInTimeZone(from, timezone);
    const toDay = dayStampInTimeZone(to, timezone);

    while (dayStampInTimeZone(occurrence, timezone) <= toDay) {
      if (
        rule.endDate &&
        dayStampInTimeZone(occurrence, timezone) >
          dayStampInTimeZone(new Date(rule.endDate), timezone)
      ) {
        break;
      }

      if (dayStampInTimeZone(occurrence, timezone) >= fromDay) {
        const inserted = await this.insertOccurrence(
          tx,
          userId,
          rule,
          occurrence,
          timezone,
        );
        if (inserted) {
          count++;
          await this.applyBalanceChanges(tx, rule);
        }
      }

      occurrence = computeNextOccurrence(occurrence, rule.frequency);
    }

    await tx
      .update(recurringTransactions)
      .set({ nextOccurrence: occurrence, updatedAt: new Date() })
      .where(eq(recurringTransactions.id, rule.id));

    return count;
  }

  private async insertOccurrence(
    tx: any,
    userId: string,
    rule: any,
    occurrence: Date,
    timezone: string,
  ) {
    const normalizedOccurrence = startOfDayInTimeZone(occurrence, timezone);

    const [inserted] = await tx
      .insert(transactions)
      .values({
        userId,
        accountId: rule.accountId,
        categoryId: rule.categoryId,
        type: rule.type,
        amount: rule.amount,
        transactionDate: normalizedOccurrence,
        notes: rule.notes,
        transferToAccountId: rule.transferToAccountId,
        recurringTransactionId: rule.id,
        occurrenceDate: normalizedOccurrence,
        isOverridden: false,
      })
      .onConflictDoNothing({
        target: [
          transactions.recurringTransactionId,
          transactions.occurrenceDate,
        ],
      })
      .returning();

    return inserted ?? null;
  }

  private async applyBalanceChanges(tx: any, rule: any) {
    const delta = Number(rule.amount) * (rule.type === 'INCOME' ? 1 : -1);
    await adjustAccountBalance(tx, rule.accountId, delta);

    if (rule.type === 'TRANSFER' && rule.transferToAccountId) {
      await adjustAccountBalance(
        tx,
        rule.transferToAccountId,
        Number(rule.amount),
      );
    }
  }

  private async validateRuleInput(
    tx: any,
    userId: string,
    input: {
      accountId: string;
      categoryId?: string | null;
      transferToAccountId?: string | null;
      type: string;
      startDate: string;
      endDate?: string | null;
    },
  ) {
    await this.ensureUserAccount(
      tx,
      userId,
      input.accountId,
      'Account not found',
    );

    if (input.type === 'TRANSFER') {
      if (!input.transferToAccountId) {
        throw new Error('Transfer account is required for TRANSFER type');
      }
      if (input.accountId === input.transferToAccountId) {
        throw new Error('Source and target account cannot be same');
      }
      await this.ensureUserAccount(
        tx,
        userId,
        input.transferToAccountId,
        'Transfer account not found',
      );
    } else if (input.categoryId) {
      const category = await tx.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, userId),
        ),
      });
      if (!category) throw new Error('Category not found');
    }

    if (input.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      if (end < start) throw new Error('End date must be after start date');
    }
  }

  private async ensureUserAccount(
    tx: any,
    userId: string,
    accountId: string,
    errorMessage: string,
  ) {
    const account = await tx.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });
    if (!account) throw new Error(errorMessage);
  }

  private async getUserTimezone(tx: any, userId: string): Promise<string> {
    const user = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { timezone: true },
    });
    return user?.timezone || 'UTC';
  }
}

export const recurringTransactionsService = new RecurringTransactionsService();
