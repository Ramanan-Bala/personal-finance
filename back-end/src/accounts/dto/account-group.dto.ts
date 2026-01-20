import { IsOptional, IsString } from 'class-validator';

export class CreateAccountGroupDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAccountGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
