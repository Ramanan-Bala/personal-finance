import { LendDebtType } from '@prisma/client';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLendDebtDto {
  @IsEnum(LendDebtType)
  type!: LendDebtType;

  @IsString()
  personName!: string;

  @IsDecimal()
  amount!: number;

  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLendDebtDto {
  @IsString()
  @IsOptional()
  personName?: string;

  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateLendDebtPaymentDto {
  @IsString()
  lendDebtId!: string;

  @IsDecimal()
  amount!: number;

  @IsISO8601()
  paymentDate!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLendDebtPaymentDto {
  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsISO8601()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
