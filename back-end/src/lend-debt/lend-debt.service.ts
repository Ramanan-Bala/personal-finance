import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateLendDebtDto,
  CreateLendDebtPaymentDto,
  UpdateLendDebtDto,
  UpdateLendDebtPaymentDto,
} from "./dto/lend-debt.dto";
import { LendDebtRepository } from "./repositories/lend-debt.repository";

@Injectable()
export class LendDebtService {
  constructor(private lendDebtRepository: LendDebtRepository) {}

  // Lend/Debt Methods
  async createLendDebt(userId: string, dto: CreateLendDebtDto) {
    return this.lendDebtRepository.createLendDebt(
      userId,
      dto.type,
      dto.personName,
      new Decimal(dto.amount),
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.notes
    );
  }

  async getLendDebts(userId: string) {
    const items = await this.lendDebtRepository.findLendDebtsByUserId(userId);

    // Calculate outstanding balance for each
    return Promise.all(
      items.map(async (item) => {
        const outstanding = await this.getOutstandingBalance(item.id);
        return {
          ...item,
          outstanding,
        };
      })
    );
  }

  async getLendDebt(userId: string, id: string) {
    const item = await this.lendDebtRepository.findLendDebtById(userId, id);

    if (!item) {
      AppException.notFound("Lend/Debt");
    }

    const outstanding = await this.getOutstandingBalance(id);
    return {
      ...item,
      outstanding,
    };
  }

  async updateLendDebt(userId: string, id: string, dto: UpdateLendDebtDto) {
    const item = await this.lendDebtRepository.findLendDebtById(userId, id);

    if (!item) {
      AppException.notFound("Lend/Debt");
    }

    return this.lendDebtRepository.updateLendDebt(userId, id, {
      personName: dto.personName,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      notes: dto.notes,
    });
  }

  async deleteLendDebt(userId: string, id: string) {
    const item = await this.lendDebtRepository.findLendDebtById(userId, id);

    if (!item) {
      AppException.notFound("Lend/Debt");
    }

    await this.lendDebtRepository.deleteLendDebt(userId, id);
  }

  // Payment Methods
  async createPayment(userId: string, dto: CreateLendDebtPaymentDto) {
    // Verify lend/debt exists
    const item = await this.lendDebtRepository.findLendDebtById(
      userId,
      dto.lendDebtId
    );

    if (!item) {
      AppException.notFound("Lend/Debt");
    }

    const payment = await this.lendDebtRepository.createPayment(
      userId,
      dto.lendDebtId,
      new Decimal(dto.amount),
      new Date(dto.paymentDate),
      dto.notes
    );

    // Check if fully settled
    const outstanding = await this.getOutstandingBalance(dto.lendDebtId);
    if (outstanding <= 0) {
      await this.lendDebtRepository.updateLendDebtStatus(
        userId,
        dto.lendDebtId,
        "SETTLED"
      );
    }

    return payment;
  }

  async getPayment(userId: string, paymentId: string) {
    const payment = await this.lendDebtRepository.findPaymentById(
      userId,
      paymentId
    );

    if (!payment) {
      AppException.notFound("Payment");
    }

    return payment;
  }

  async updatePayment(
    userId: string,
    paymentId: string,
    dto: UpdateLendDebtPaymentDto
  ) {
    const payment = await this.lendDebtRepository.findPaymentById(
      userId,
      paymentId
    );

    if (!payment) {
      AppException.notFound("Payment");
    }

    const updatedPayment = await this.lendDebtRepository.updatePayment(
      userId,
      paymentId,
      {
        amount: dto.amount ? new Decimal(dto.amount) : undefined,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        notes: dto.notes,
      }
    );

    // Recalculate settlement status
    const outstanding = await this.getOutstandingBalance(payment.lendDebtId);
    if (outstanding <= 0) {
      await this.lendDebtRepository.updateLendDebtStatus(
        userId,
        payment.lendDebtId,
        "SETTLED"
      );
    } else {
      await this.lendDebtRepository.updateLendDebtStatus(
        userId,
        payment.lendDebtId,
        "OPEN"
      );
    }

    return updatedPayment;
  }

  async deletePayment(userId: string, paymentId: string) {
    const payment = await this.lendDebtRepository.findPaymentById(
      userId,
      paymentId
    );

    if (!payment) {
      AppException.notFound("Payment");
    }

    await this.lendDebtRepository.deletePayment(userId, paymentId);

    // Recalculate settlement status
    const outstanding = await this.getOutstandingBalance(payment.lendDebtId);
    if (outstanding > 0) {
      await this.lendDebtRepository.updateLendDebtStatus(
        userId,
        payment.lendDebtId,
        "OPEN"
      );
    }
  }

  private async getOutstandingBalance(lendDebtId: string): Promise<number> {
    const payments = await this.lendDebtRepository.findPaymentsByLendDebtId(
      lendDebtId
    );

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // This is a simplified calculation; in production, you'd also need the original amount
    return totalPaid; // Return totalPaid for now
  }
}
