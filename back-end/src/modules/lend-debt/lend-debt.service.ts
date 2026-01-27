import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { lendDebtPayments, lendDebts } from '../../db/schema';
import {
  CreateLendDebtInput,
  CreateLendDebtPaymentInput,
  UpdateLendDebtInput,
  UpdateLendDebtPaymentInput,
} from './lend-debt.schema';

export class LendDebtService {
  // Lend/Debt
  async createLendDebt(userId: string, input: CreateLendDebtInput) {
    const [item] = await db
      .insert(lendDebts)
      .values({
        userId,
        type: input.type,
        personName: input.personName,
        amount: input.amount.toString(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes,
        status: 'OPEN',
      })
      .returning();

    if (!item) return null;
    const { createdAt, updatedAt, ...rest } = item;
    return rest;
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
      },
    });

    return items.map(item => {
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
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);

    const [item] = await db
      .update(lendDebts)
      .set(updateData)
      .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)))
      .returning();

    if (!item) return null;
    const { createdAt, updatedAt, ...rest } = item;
    return rest;
  }

  async deleteLendDebt(userId: string, id: string) {
    const item = await db.query.lendDebts.findFirst({
      where: and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)),
    });

    if (!item) return null;

    await db
      .delete(lendDebts)
      .where(and(eq(lendDebts.id, id), eq(lendDebts.userId, userId)));
    return true;
  }

  // Payments
  async createPayment(userId: string, input: CreateLendDebtPaymentInput) {
    const item = await db.query.lendDebts.findFirst({
      where: and(
        eq(lendDebts.id, input.lendDebtId),
        eq(lendDebts.userId, userId),
      ),
    });

    if (!item) throw new Error('Lend/Debt not found');

    const [payment] = await db
      .insert(lendDebtPayments)
      .values({
        userId,
        lendDebtId: input.lendDebtId,
        amount: input.amount.toString(),
        paymentDate: new Date(input.paymentDate),
        notes: input.notes,
      })
      .returning();

    await this.updateStatus(userId, input.lendDebtId);

    if (!payment) return null;
    const { createdAt, updatedAt, ...rest } = payment;
    return rest;
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
    const payment = await db.query.lendDebtPayments.findFirst({
      where: and(
        eq(lendDebtPayments.id, paymentId),
        eq(lendDebtPayments.userId, userId),
      ),
    });
    if (!payment) return null;

    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.amount) updateData.amount = input.amount.toString();
    if (input.paymentDate) updateData.paymentDate = new Date(input.paymentDate);

    const [updatedPayment] = await db
      .update(lendDebtPayments)
      .set(updateData)
      .where(
        and(
          eq(lendDebtPayments.id, paymentId),
          eq(lendDebtPayments.userId, userId),
        ),
      )
      .returning();

    await this.updateStatus(userId, payment.lendDebtId);

    if (!updatedPayment) return null;
    const { createdAt, updatedAt, ...rest } = updatedPayment;
    return rest;
  }

  async deletePayment(userId: string, paymentId: string) {
    const payment = await db.query.lendDebtPayments.findFirst({
      where: and(
        eq(lendDebtPayments.id, paymentId),
        eq(lendDebtPayments.userId, userId),
      ),
    });
    if (!payment) return null;

    await db
      .delete(lendDebtPayments)
      .where(
        and(
          eq(lendDebtPayments.id, paymentId),
          eq(lendDebtPayments.userId, userId),
        ),
      );

    await this.updateStatus(userId, payment.lendDebtId);
    return true;
  }

  private async updateStatus(userId: string, lendDebtId: string) {
    const item = await this.getLendDebt(userId, lendDebtId);
    if (!item) return;

    const newStatus = item.outstanding <= 0 ? 'SETTLED' : 'OPEN';

    if (item.status !== newStatus) {
      await db
        .update(lendDebts)
        .set({ status: newStatus })
        .where(eq(lendDebts.id, lendDebtId));
    }
  }
}

export const lendDebtService = new LendDebtService();
