import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ProfessionType } from '@prisma/client';

export class AdminCreateProfessionalDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsEnum(ProfessionType)
  professionType!: ProfessionType;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
