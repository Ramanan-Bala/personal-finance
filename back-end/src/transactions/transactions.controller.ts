import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from "./dto/transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  async createTransaction(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateTransactionDto
  ) {
    return this.transactionsService.createTransaction(user.id, dto);
  }

  @Get()
  async getTransactions(
    @CurrentUser() user: any,
    @Query("accountId") accountId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    if (accountId) {
      return this.transactionsService.getTransactionsByAccount(
        user.id,
        accountId
      );
    }

    if (from && to) {
      return this.transactionsService.getTransactionsByDateRange(
        user.id,
        new Date(from),
        new Date(to)
      );
    }

    return { message: "Provide accountId or date range (from, to)" };
  }

  @Get(":transactionId")
  async getTransaction(
    @CurrentUser() user: any,
    @Param("transactionId") transactionId: string
  ) {
    return this.transactionsService.getTransaction(user.id, transactionId);
  }

  @Patch(":transactionId")
  async updateTransaction(
    @CurrentUser() user: any,
    @Param("transactionId") transactionId: string,
    @Body(ValidationPipe) dto: UpdateTransactionDto
  ) {
    return this.transactionsService.updateTransaction(
      user.id,
      transactionId,
      dto
    );
  }

  @Delete(":transactionId")
  async deleteTransaction(
    @CurrentUser() user: any,
    @Param("transactionId") transactionId: string
  ) {
    await this.transactionsService.deleteTransaction(user.id, transactionId);
    return { message: "Transaction deleted" };
  }
}
