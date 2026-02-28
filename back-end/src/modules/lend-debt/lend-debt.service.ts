import { and, eq, sql } from 'drizzle-orm';
import { stripTimestamps } from '../../common/utils';
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

  private getPaymentBalanceDelta(
    type: 'LEND' | 'DEBT',
    amount: number,
  ): number {
    return type === 'LEND' ? amount : -amount;
  }

  private async adjustBalance(tx: any, accountId: string, delta: number) {
    await tx
      .update(accounts)
      .set({ openingBalance: sql`${accounts.openingBalance} + ${delta}` })
      .where(eq(accounts.id, accountId));
  }

  private async verifyUserAccount(tx: any, accountId: string, userId: string) {
    const account = await tx.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
    });
    if (!account) throw new Error('Account not found');
    return account;
  }

  private computeOutstanding(item: any): number {
    const totalPaid = item.payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );
    return Number(item.amount) - totalPaid;
  }

  private async updateStatus(tx: any, userId: string, lendDebtId: string) {
    const item = await tx.query.lendDebts.findFirst({
      where: and(eq(lendDebts.id, lendDebtId), eq(lendDebts.userId, userId)),
      with: { payments: true },
    });
    if (!item) return;

    const outstanding = this.computeOutstanding(item);
    const newStatus = outstanding <= 0 ? 'SETTLED' : 'OPEN';

    if (item.status !== newStatus) {
      await tx
        .update(lendDebts)
        .set({ status: newStatus })
        .where(eq(lendDebts.id, lendDebtId));
    }
  }

  // --- Lend/Debt CRUD ---

  async createLendDebt(userId: string, input: CreateLendDebtInput) {
    return db.transaction(async tx => {
      await this.verifyUserAccount(tx, input.accountId, userId);

      const delta = this.getBalanceDelta(input.type, input.amount);
      await this.adjustBalance(tx, input.accountId, delta);

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

      return item ? stripTimestamps(item) : null;
    });
  }

  async getLendDebts(userId: string) {
    const items = await db.query.lendDebts.findMany({
      where: eq(lendDebts.userId, userId),
      columns: { createdAt: false, updatedAt: false },
      with: {
        payments: { columns: { createdAt: false, updatedAt: false } },
        account: { columns: { createdAt: false, updatedAt: false } },
      },
    });

    return items.map(item => ({
      ...item,
      outstanding: this.computeOutstanding(item),
    }));
  }

  async getLendDebt(userId: string, id: string) {
    const item = await db.query.lendDebts.findFirst({
      where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
      columns: { createdAt: false, updatedAt: false },
      with: {
        payments: { columns: { createdAt: false, updatedAt: false } },
        account: { columns: { createdAt: false, updatedAt: false } },
      },
    });
    if (!item) return null;

    return { ...item, outstanding: this.computeOutstanding(item) };
  }

  async updateLendDebt(userId: string, id: string, input: UpdateLendDebtInput) {
    return db.transaction(async tx => {
      const existing = await tx.query.lendDebts.findFirst({
        where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
      });
      if (!existing) return null;

      const newAccountId = input.accountId ?? existing.accountId;
      const newAmount = input.amount ?? Number(existing.amount);
      const newType = input.type ?? existing.type;

      if (input.accountId && input.accountId !== existing.accountId) {
        await this.verifyUserAccount(tx, input.accountId, userId);
      }

      const hasBalanceChange =
        input.amount !== undefined ||
        input.type !== undefined ||
        input.accountId !== undefined;

      if (hasBalanceChange) {
        const oldDelta = this.getBalanceDelta(
          existing.type,
          Number(existing.amount),
        );
        await this.adjustBalance(tx, existing.accountId, -oldDelta);

        const newDelta = this.getBalanceDelta(newType, newAmount);
        await this.adjustBalance(tx, newAccountId, newDelta);
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.personName !== undefined)
        updateData.personName = input.personName;
      if (input.phoneNumber !== undefined)
        updateData.phoneNumber = input.phoneNumber;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.dueDate !== undefined)
        updateData.dueDate = new Date(input.dueDate);
      if (input.accountId !== undefined) updateData.accountId = input.accountId;
      if (input.amount !== undefined)
        updateData.amount = input.amount.toString();
      if (input.type !== undefined) updateData.type = input.type;

      const [item] = await tx
        .update(lendDebts)
        .set(updateData)
        .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)))
        .returning();

      return item ? stripTimestamps(item) : null;
    });
  }

  async deleteLendDebt(userId: string, id: string) {
    return db.transaction(async tx => {
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
        await this.adjustBalance(tx, payment.accountId, -paymentDelta);
      }

      const lendDebtDelta = this.getBalanceDelta(
        item.type,
        Number(item.amount),
      );
      await this.adjustBalance(tx, item.accountId, -lendDebtDelta);

      await tx
        .delete(lendDebts)
        .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)));
      return true;
    });
  }

  // --- Payments ---

  async createPayment(userId: string, input: CreateLendDebtPaymentInput) {
    return db.transaction(async tx => {
      const item = await tx.query.lendDebts.findFirst({
        where: and(
          eq(lendDebts.id, input.lendDebtId),
          eq(lendDebts.userId, userId),
        ),
      });
      if (!item) throw new Error('Lend/Debt not found');

      await this.verifyUserAccount(tx, input.accountId, userId);

      const delta = this.getPaymentBalanceDelta(item.type, input.amount);
      await this.adjustBalance(tx, input.accountId, delta);

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

      await this.updateStatus(tx, userId, input.lendDebtId);
      return payment ? stripTimestamps(payment) : null;
    });
  }

  async getPayment(userId: string, paymentId: string) {
    return db.query.lendDebtPayments.findFirst({
      where: and(
        eq(lendDebtPayments.id, paymentId),
        eq(lendDebtPayments.userId, userId),
      ),
      columns: { createdAt: false, updatedAt: false },
    });
  }

  async updatePayment(
    userId: string,
    paymentId: string,
    input: UpdateLendDebtPaymentInput,
  ) {
    return db.transaction(async tx => {
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
        await this.adjustBalance(tx, payment.accountId, -oldDelta);

        if (input.accountId && input.accountId !== payment.accountId) {
          await this.verifyUserAccount(tx, input.accountId, userId);
        }

        const newDelta = this.getPaymentBalanceDelta(lendDebt.type, newAmount);
        await this.adjustBalance(tx, newAccountId, newDelta);
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.amount !== undefined)
        updateData.amount = input.amount.toString();
      if (input.paymentDate !== undefined)
        updateData.paymentDate = new Date(input.paymentDate);
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
      return updatedPayment ? stripTimestamps(updatedPayment) : null;
    });
  }

  async deletePayment(userId: string, paymentId: string) {
    return db.transaction(async tx => {
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
      await this.adjustBalance(tx, payment.accountId, -delta);

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
}

export const lendDebtService = new LendDebtService();
