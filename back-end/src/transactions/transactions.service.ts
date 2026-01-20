import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { PrismaClient, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from "./dto/transaction.dto";
import { TransactionsRepository } from "./repositories/transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaClient,
    private transactionsRepository: TransactionsRepository
  ) {}

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    // Verify account exists
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      AppException.notFound("Account");
    }

    // Verify category exists if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });

      if (!category) {
        AppException.notFound("Category");
      }
    }

    // For transfers, verify target account exists
    if (dto.type === TransactionType.TRANSFER && dto.transferToAccountId) {
      const targetAccount = await this.prisma.account.findFirst({
        where: { id: dto.transferToAccountId, userId },
      });

      if (!targetAccount) {
        AppException.notFound("Target Account");
      }
    }

    // Use database transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          type: dto.type,
          amount: new Decimal(dto.amount),
          transactionDate: new Date(dto.transactionDate),
          notes: dto.notes,
          transferToAccountId: dto.transferToAccountId,
        },
      });

      return transaction;
    });
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionsRepository.findTransactionById(
      userId,
      transactionId
    );

    if (!transaction) {
      AppException.notFound("Transaction");
    }

    return transaction;
  }

  async getTransactionsByAccount(userId: string, accountId: string) {
    // Verify account exists
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      AppException.notFound("Account");
    }

    return this.transactionsRepository.findTransactionsByAccountId(
      userId,
      accountId
    );
  }

  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.transactionsRepository.findTransactionsByDateRange(
      userId,
      startDate,
      endDate
    );
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto
  ) {
    const transaction = await this.transactionsRepository.findTransactionById(
      userId,
      transactionId
    );

    if (!transaction) {
      AppException.notFound("Transaction");
    }

    // Verify category exists if being updated
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });

      if (!category) {
        AppException.notFound("Category");
      }
    }

    return this.transactionsRepository.updateTransaction(
      userId,
      transactionId,
      {
        ...dto,
        amount: dto.amount ? new Decimal(dto.amount) : undefined,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : undefined,
      }
    );
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionsRepository.findTransactionById(
      userId,
      transactionId
    );

    if (!transaction) {
      AppException.notFound("Transaction");
    }

    await this.transactionsRepository.deleteTransaction(userId, transactionId);
  }
}
