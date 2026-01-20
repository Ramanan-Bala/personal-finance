import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  groupId!: string;

  @IsString()
  name!: string;

  @IsDecimal()
  openingBalance!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
