import { Injectable } from '@nestjs/common';
import {
  LendDebt,
  LendDebtPayment,
  LendDebtStatus,
  PrismaClient,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LendDebtRepository {
  constructor(private prisma: PrismaClient) {}

  // Lend/Debt Operations
  async createLendDebt(
    userId: string,
    type: any,
    personName: string,
    amount: Decimal,
    dueDate?: Date,
    notes?: string,
  ): Promise<LendDebt> {
    return this.prisma.lendDebt.create({
      data: {
        userId,
        type,
        personName,
        amount,
        dueDate,
        notes,
      },
    });
  }

  async findLendDebtById(userId: string, id: string): Promise<LendDebt | null> {
    return this.prisma.lendDebt.findFirst({
      where: { id, userId },
    });
  }

  async findLendDebtsByUserId(userId: string): Promise<LendDebt[]> {
    return this.prisma.lendDebt.findMany({
      where: { userId },
      include: { payments: true },
    });
  }

  async updateLendDebt(
    _userId: string,
    id: string,
    data: Partial<LendDebt>,
  ): Promise<LendDebt> {
    return this.prisma.lendDebt.update({
      where: { id },
      data: {
        personName: data.personName,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });
  }

  async deleteLendDebt(_userId: string, id: string): Promise<void> {
    await this.prisma.lendDebt.delete({
      where: { id },
    });
  }

  // Payment Operations
  async createPayment(
    userId: string,
    lendDebtId: string,
    amount: Decimal,
    paymentDate: Date,
    notes?: string,
  ): Promise<LendDebtPayment> {
    return this.prisma.lendDebtPayment.create({
      data: {
        userId,
        lendDebtId,
        amount,
        paymentDate,
        notes,
      },
    });
  }

  async findPaymentById(
    _userId: string,
    id: string,
  ): Promise<LendDebtPayment | null> {
    return this.prisma.lendDebtPayment.findFirst({
      where: { id, userId: _userId },
    });
  }

  async findPaymentsByLendDebtId(
    lendDebtId: string,
  ): Promise<LendDebtPayment[]> {
    return this.prisma.lendDebtPayment.findMany({
      where: { lendDebtId },
    });
  }

  async updatePayment(
    _userId: string,
    id: string,
    data: Partial<LendDebtPayment>,
  ): Promise<LendDebtPayment> {
    return this.prisma.lendDebtPayment.update({
      where: { id },
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        notes: data.notes,
      },
    });
  }

  async deletePayment(_userId: string, id: string): Promise<void> {
    await this.prisma.lendDebtPayment.delete({
      where: { id },
    });
  }

  async updateLendDebtStatus(
    _userId: string,
    id: string,
    status: LendDebtStatus,
  ): Promise<LendDebt> {
    return this.prisma.lendDebt.update({
      where: { id },
      data: { status },
    });
  }
}
