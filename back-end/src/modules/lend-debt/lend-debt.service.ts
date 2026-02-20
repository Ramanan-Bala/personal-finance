import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { accounts, lendDebtPayments, lendDebts } from '../../db/schema';
import {
  CreateLendDebtInput,
  CreateLendDebtPaymentInput,
  UpdateLendDebtInput,
  UpdateLendDebtPaymentInput,
} from './lend-debt.schema';

export class LendDebtService {
  private getBalanceDelta(type: 'LEND' | 'DEBT', amount: number): number {
    return type === 'LEND' ? -amount : amount;
  }

  private getPaymentBalanceDelta(type: 'LEND' | 'DEBT', amount: number): number {
    return type === 'LEND' ? amount : -amount;
  }

  // Lend/Debt
  async createLendDebt(userId: string, input: CreateLendDebtInput) {
    return db.transaction(async (tx) => {
      const account = await tx.query.accounts.findFirst({
        where: and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
      });
      if (!account) throw new Error('Account not found');

      const delta = this.getBalanceDelta(input.type, input.amount);
      await tx
        .update(accounts)
        .set({ openingBalance: sql`${accounts.openingBalance} + ${delta}` })
        .where(eq(accounts.id, input.accountId));

      const [item] = await tx
        .insert(lendDebts)
        .values({
          userId,
          accountId: input.accountId,
          type: input.type,
          personName: input.personName,
          phoneNumber: input.phoneNumber,
          amount: input.amount.toString(),
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          notes: input.notes,
          status: 'OPEN',
        })
        .returning();

      if (!item) return null;
      const { createdAt, updatedAt, ...rest } = item;
      return rest;
    });
  }

  async getLendDebts(userId: string) {
    const items = await db.query.lendDebts.findMany({
      where: eq(lendDebts.userId, userId),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        payments: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
        account: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });

    return items.map((item) => {
      const totalPaid = item.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const outstanding = Number(item.amount) - totalPaid;
      return { ...item, outstanding };
    });
  }

  async getLendDebt(userId: string, id: string) {
    const item = await db.query.lendDebts.findFirst({
      where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        payments: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
        account: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });

    if (!item) return null;

    const totalPaid = item.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const outstanding = Number(item.amount) - totalPaid;
    return { ...item, outstanding };
  }

  async updateLendDebt(userId: string, id: string, input: UpdateLendDebtInput) {
    return db.transaction(async (tx) => {
      const existing = await tx.query.lendDebts.findFirst({
        where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
      });
      if (!existing) return null;

      const newAccountId = input.accountId ?? existing.accountId;
      const newAmount = input.amount ?? Number(existing.amount);
      const newType = input.type ?? existing.type;

      if (input.accountId && input.accountId !== existing.accountId) {
        const account = await tx.query.accounts.findFirst({
          where: and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
        });
        if (!account) throw new Error('Account not found');
      }

      const hasBalanceChange =
        input.amount !== undefined ||
        input.type !== undefined ||
        input.accountId !== undefined;

      if (hasBalanceChange) {
        const oldDelta = this.getBalanceDelta(existing.type, Number(existing.amount));
        await tx
          .update(accounts)
          .set({ openingBalance: sql`${accounts.openingBalance} - ${oldDelta}` })
          .where(eq(accounts.id, existing.accountId));

        const newDelta = this.getBalanceDelta(newType, newAmount);
        await tx
          .update(accounts)
          .set({ openingBalance: sql`${accounts.openingBalance} + ${newDelta}` })
          .where(eq(accounts.id, newAccountId));
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.personName !== undefined) updateData.personName = input.personName;
      if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
      if (input.accountId !== undefined) updateData.accountId = input.accountId;
      if (input.amount !== undefined) updateData.amount = input.amount.toString();
      if (input.type !== undefined) updateData.type = input.type;

      const [item] = await tx
        .update(lendDebts)
        .set(updateData)
        .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)))
        .returning();

      if (!item) return null;
      const { createdAt, updatedAt, ...rest } = item;
      return rest;
    });
  }

  async deleteLendDebt(userId: string, id: string) {
    return db.transaction(async (tx) => {
      const item = await tx.query.lendDebts.findFirst({
        where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
        with: { payments: true },
      });
      if (!item) return null;

      for (const payment of item.payments) {
        const paymentDelta = this.getPaymentBalanceDelta(
          item.type,
          Number(payment.amount),
        );
        await tx
          .update(accounts)
          .set({ openingBalance: sql`${accounts.openingBalance} - ${paymentDelta}` })
          .where(eq(accounts.id, payment.accountId));
      }

      const lendDebtDelta = this.getBalanceDelta(item.type, Number(item.amount));
      await tx
        .update(accounts)
        .set({ openingBalance: sql`${accounts.openingBalance} - ${lendDebtDelta}` })
        .where(eq(accounts.id, item.accountId));

      await tx
        .delete(lendDebts)
        .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)));

      return true;
    });
  }

  // Payments
  async createPayment(userId: string, input: CreateLendDebtPaymentInput) {
    return db.transaction(async (tx) => {
      const item = await tx.query.lendDebts.findFirst({
        where: and(
          eq(lendDebts.id, input.lendDebtId),
          eq(lendDebts.userId, userId),
        ),
      });
      if (!item) throw new Error('Lend/Debt not found');

      const account = await tx.query.accounts.findFirst({
        where: and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
      });
      if (!account) throw new Error('Account not found');

      const delta = this.getPaymentBalanceDelta(item.type, input.amount);
      await tx
        .update(accounts)
        .set({ openingBalance: sql`${accounts.openingBalance} + ${delta}` })
        .where(eq(accounts.id, input.accountId));

      const [payment] = await tx
        .insert(lendDebtPayments)
        .values({
          userId,
          lendDebtId: input.lendDebtId,
          accountId: input.accountId,
          amount: input.amount.toString(),
          paymentDate: new Date(input.paymentDate),
          notes: input.notes,
        })
        .returning();

      if (!payment) return null;
      const { createdAt, updatedAt, ...rest } = payment;

      await this.updateStatus(tx, userId, input.lendDebtId);
      return rest;
    });
  }

  async getPayment(userId: string, paymentId: string) {
    return db.query.lendDebtPayments.findFirst({
      where: and(
        eq(lendDebtPayments.id, paymentId),
        eq(lendDebtPayments.userId, userId),
      ),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
    });
  }

  async updatePayment(
    userId: string,
    paymentId: string,
    input: UpdateLendDebtPaymentInput,
  ) {
    return db.transaction(async (tx) => {
      const payment = await tx.query.lendDebtPayments.findFirst({
        where: and(
          eq(lendDebtPayments.id, paymentId),
          eq(lendDebtPayments.userId, userId),
        ),
      });
      if (!payment) return null;

      const lendDebt = await tx.query.lendDebts.findFirst({
        where: eq(lendDebts.id, payment.lendDebtId),
      });
      if (!lendDebt) return null;

      const newAccountId = input.accountId ?? payment.accountId;
      const newAmount = input.amount ?? Number(payment.amount);

      const hasBalanceChange =
        input.amount !== undefined || input.accountId !== undefined;

      if (hasBalanceChange) {
        const oldDelta = this.getPaymentBalanceDelta(
          lendDebt.type,
          Number(payment.amount),
        );
        await tx
          .update(accounts)
          .set({ openingBalance: sql`${accounts.openingBalance} - ${oldDelta}` })
          .where(eq(accounts.id, payment.accountId));

        if (input.accountId && input.accountId !== payment.accountId) {
          const account = await tx.query.accounts.findFirst({
            where: and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
          });
          if (!account) throw new Error('Account not found');
        }

        const newDelta = this.getPaymentBalanceDelta(lendDebt.type, newAmount);
        await tx
          .update(accounts)
          .set({ openingBalance: sql`${accounts.openingBalance} + ${newDelta}` })
          .where(eq(accounts.id, newAccountId));
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.amount !== undefined) updateData.amount = input.amount.toString();
      if (input.paymentDate !== undefined) updateData.paymentDate = new Date(input.paymentDate);
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.accountId !== undefined) updateData.accountId = input.accountId;

      const [updatedPayment] = await tx
        .update(lendDebtPayments)
        .set(updateData)
        .where(
          and(
            eq(lendDebtPayments.id, paymentId),
            eq(lendDebtPayments.userId, userId),
          ),
        )
        .returning();

      await this.updateStatus(tx, userId, payment.lendDebtId);

      if (!updatedPayment) return null;
      const { createdAt, updatedAt, ...rest } = updatedPayment;
      return rest;
    });
  }

  async deletePayment(userId: string, paymentId: string) {
    return db.transaction(async (tx) => {
      const payment = await tx.query.lendDebtPayments.findFirst({
        where: and(
          eq(lendDebtPayments.id, paymentId),
          eq(lendDebtPayments.userId, userId),
        ),
      });
      if (!payment) return null;

      const lendDebt = await tx.query.lendDebts.findFirst({
        where: eq(lendDebts.id, payment.lendDebtId),
      });
      if (!lendDebt) return null;

      const delta = this.getPaymentBalanceDelta(
        lendDebt.type,
        Number(payment.amount),
      );
      await tx
        .update(accounts)
        .set({ openingBalance: sql`${accounts.openingBalance} - ${delta}` })
        .where(eq(accounts.id, payment.accountId));

      await tx
        .delete(lendDebtPayments)
        .where(
          and(
            eq(lendDebtPayments.id, paymentId),
            eq(lendDebtPayments.userId, userId),
          ),
        );

      await this.updateStatus(tx, userId, payment.lendDebtId);
      return true;
    });
  }

  private async updateStatus(tx: any, userId: string, lendDebtId: string) {
    const item = await tx.query.lendDebts.findFirst({
      where: and(eq(lendDebts.id, lendDebtId), eq(lendDebts.userId, userId)),
      with: { payments: true },
    });
    if (!item) return;

    const totalPaid = item.payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );
    const outstanding = Number(item.amount) - totalPaid;
    const newStatus = outstanding <= 0 ? 'SETTLED' : 'OPEN';

    if (item.status !== newStatus) {
      await tx
        .update(lendDebts)
        .set({ status: newStatus })
        .where(eq(lendDebts.id, lendDebtId));
    }
  }
}

export const lendDebtService = new LendDebtService();
