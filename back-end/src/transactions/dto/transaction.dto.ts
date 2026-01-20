import { TransactionType } from '@prisma/client';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  accountId!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsDecimal()
  amount!: number;

  @IsISO8601()
  transactionDate!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  transferToAccountId?: string;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsISO8601()
  @IsOptional()
  transactionDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
