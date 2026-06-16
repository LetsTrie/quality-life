import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { Gender, MaritalStatus } from '@prisma/client';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName?: string;

  // MVP: accept ageYears; server derives an approximate DOB (Jan 1).
  @IsOptional()
  @IsString()
  ageYears?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  marital?: MaritalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  // Location (Bangladesh hierarchy). Client may send district only, or also upazila/union.
  @IsOptional()
  @IsUUID()
  districtId?: string;

  @IsOptional()
  @IsUUID()
  upazilaId?: string;

  @IsOptional()
  @IsUUID()
  unionId?: string;
}

