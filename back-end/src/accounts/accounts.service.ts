import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateAccountGroupDto,
  UpdateAccountGroupDto,
} from "./dto/account-group.dto";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";
import { AccountsRepository } from "./repositories/accounts.repository";

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

  // Account Group Methods
  async createAccountGroup(userId: string, dto: CreateAccountGroupDto) {
    return this.accountsRepository.createAccountGroup(
      userId,
      dto.name,
      dto.description
    );
  }

  async getAccountGroups(userId: string) {
    return this.accountsRepository.findAccountGroupsByUserId(userId);
  }

  async updateAccountGroup(
    userId: string,
    groupId: string,
    dto: UpdateAccountGroupDto
  ) {
    const group = await this.accountsRepository.findAccountGroupById(
      userId,
      groupId
    );

    if (!group) {
      AppException.notFound("Account Group");
    }

    return this.accountsRepository.updateAccountGroup(userId, groupId, dto);
  }

  async deleteAccountGroup(userId: string, groupId: string) {
    const group = await this.accountsRepository.findAccountGroupById(
      userId,
      groupId
    );

    if (!group) {
      AppException.notFound("Account Group");
    }

    await this.accountsRepository.deleteAccountGroup(userId, groupId);
  }

  // Account Methods
  async createAccount(userId: string, dto: CreateAccountDto) {
    // Verify group exists
    const group = await this.accountsRepository.findAccountGroupById(
      userId,
      dto.groupId
    );

    if (!group) {
      AppException.notFound("Account Group");
    }

    return this.accountsRepository.createAccount(
      userId,
      dto.groupId,
      dto.name,
      new Decimal(dto.openingBalance),
      dto.description
    );
  }

  async getAccounts(userId: string) {
    return this.accountsRepository.findAccountsByUserId(userId);
  }

  async getAccount(userId: string, accountId: string) {
    const account = await this.accountsRepository.findAccountById(
      userId,
      accountId
    );

    if (!account) {
      AppException.notFound("Account");
    }

    return account;
  }

  async updateAccount(
    userId: string,
    accountId: string,
    dto: UpdateAccountDto
  ) {
    const account = await this.accountsRepository.findAccountById(
      userId,
      accountId
    );

    if (!account) {
      AppException.notFound("Account");
    }

    return this.accountsRepository.updateAccount(userId, accountId, dto);
  }

  async deleteAccount(userId: string, accountId: string) {
    const account = await this.accountsRepository.findAccountById(
      userId,
      accountId
    );

    if (!account) {
      AppException.notFound("Account");
    }

    // Check if account has transactions
    const hasTransactions = await this.accountsRepository.hasTransactions(
      accountId
    );

    if (hasTransactions) {
      AppException.badRequest("Cannot delete account with transactions");
    }

    await this.accountsRepository.deleteAccount(userId, accountId);
  }
}
