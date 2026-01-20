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
import { AccountsService } from "./accounts.service";
import {
  CreateAccountGroupDto,
  UpdateAccountGroupDto,
} from "./dto/account-group.dto";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@Controller("accounts")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  // Account Groups
  @Post("groups")
  async createAccountGroup(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateAccountGroupDto
  ) {
    return this.accountsService.createAccountGroup(user.id, dto);
  }

  @Get("groups")
  async getAccountGroups(@CurrentUser() user: any) {
    return this.accountsService.getAccountGroups(user.id);
  }

  @Patch("groups/:groupId")
  async updateAccountGroup(
    @CurrentUser() user: any,
    @Param("groupId") groupId: string,
    @Body(ValidationPipe) dto: UpdateAccountGroupDto
  ) {
    return this.accountsService.updateAccountGroup(user.id, groupId, dto);
  }

  @Delete("groups/:groupId")
  async deleteAccountGroup(
    @CurrentUser() user: any,
    @Param("groupId") groupId: string
  ) {
    await this.accountsService.deleteAccountGroup(user.id, groupId);
    return { message: "Account group deleted" };
  }

  // Accounts
  @Post()
  async createAccount(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateAccountDto
  ) {
    return this.accountsService.createAccount(user.id, dto);
  }

  @Get()
  async getAccounts(@CurrentUser() user: any) {
    return this.accountsService.getAccounts(user.id);
  }

  @Get(":accountId")
  async getAccount(
    @CurrentUser() user: any,
    @Param("accountId") accountId: string
  ) {
    return this.accountsService.getAccount(user.id, accountId);
  }

  @Patch(":accountId")
  async updateAccount(
    @CurrentUser() user: any,
    @Param("accountId") accountId: string,
    @Body(ValidationPipe) dto: UpdateAccountDto
  ) {
    return this.accountsService.updateAccount(user.id, accountId, dto);
  }

  @Delete(":accountId")
  async deleteAccount(
    @CurrentUser() user: any,
    @Param("accountId") accountId: string
  ) {
    await this.accountsService.deleteAccount(user.id, accountId);
    return { message: "Account deleted" };
  }
}
