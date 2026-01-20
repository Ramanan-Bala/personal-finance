import { Injectable } from '@nestjs/common';
import { PrismaClient, Transaction, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaClient) {}

  async createTransaction(
    userId: string,
    accountId: string,
    type: TransactionType,
    amount: Decimal,
    transactionDate: Date,
    categoryId?: string,
    notes?: string,
    transferToAccountId?: string,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        amount,
        transactionDate,
        notes,
        transferToAccountId,
      },
    });
  }

  async findTransactionById(
    userId: string,
    transactionId: string,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });
  }

  async findTransactionsByAccountId(
    userId: string,
    accountId: string,
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        accountId,
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async findTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async updateTransaction(
    _userId: string,
    transactionId: string,
    data: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId: data.categoryId,
        amount: data.amount,
        transactionDate: data.transactionDate,
        notes: data.notes,
      },
    });
  }

  async deleteTransaction(
    _userId: string,
    transactionId: string,
  ): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id: transactionId },
    });
  }
}
