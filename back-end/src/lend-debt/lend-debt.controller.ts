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
  UseFilters,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  CreateLendDebtDto,
  CreateLendDebtPaymentDto,
  UpdateLendDebtDto,
  UpdateLendDebtPaymentDto,
} from "./dto/lend-debt.dto";
import { LendDebtService } from "./lend-debt.service";

@Controller("lend-debt")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class LendDebtController {
  constructor(private lendDebtService: LendDebtService) {}

  // Lend/Debt Endpoints
  @Post()
  async createLendDebt(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateLendDebtDto
  ) {
    return this.lendDebtService.createLendDebt(user.id, dto);
  }

  @Get()
  async getLendDebts(@CurrentUser() user: any) {
    return this.lendDebtService.getLendDebts(user.id);
  }

  @Get(":id")
  async getLendDebt(@CurrentUser() user: any, @Param("id") id: string) {
    return this.lendDebtService.getLendDebt(user.id, id);
  }

  @Patch(":id")
  async updateLendDebt(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body(ValidationPipe) dto: UpdateLendDebtDto
  ) {
    return this.lendDebtService.updateLendDebt(user.id, id, dto);
  }

  @Delete(":id")
  async deleteLendDebt(@CurrentUser() user: any, @Param("id") id: string) {
    await this.lendDebtService.deleteLendDebt(user.id, id);
    return { message: "Lend/Debt deleted" };
  }

  // Payment Endpoints
  @Post("payments")
  async createPayment(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateLendDebtPaymentDto
  ) {
    return this.lendDebtService.createPayment(user.id, dto);
  }

  @Get("payments/:paymentId")
  async getPayment(
    @CurrentUser() user: any,
    @Param("paymentId") paymentId: string
  ) {
    return this.lendDebtService.getPayment(user.id, paymentId);
  }

  @Patch("payments/:paymentId")
  async updatePayment(
    @CurrentUser() user: any,
    @Param("paymentId") paymentId: string,
    @Body(ValidationPipe) dto: UpdateLendDebtPaymentDto
  ) {
    return this.lendDebtService.updatePayment(user.id, paymentId, dto);
  }

  @Delete("payments/:paymentId")
  async deletePayment(
    @CurrentUser() user: any,
    @Param("paymentId") paymentId: string
  ) {
    await this.lendDebtService.deletePayment(user.id, paymentId);
    return { message: "Payment deleted" };
  }
}
