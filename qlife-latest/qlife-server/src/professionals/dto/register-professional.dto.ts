import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { Gender, ProfessionType } from '@prisma/client';

export class RegisterProfessionalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEnum(ProfessionType)
  professionType!: ProfessionType;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}

