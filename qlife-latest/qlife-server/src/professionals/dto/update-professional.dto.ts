import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Gender, ProfessionType, Weekday } from '@prisma/client';

/// A single recurring weekly availability window. Times are wall-clock
/// "HH:MM" (24h) strings interpreted in the professional's timezone.
export class AvailabilityWindowDto {
  @IsEnum(Weekday)
  weekday!: Weekday;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be HH:MM (24h)' })
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be HH:MM (24h)' })
  endTime!: string;
}

/// A selected clinical specialization. `note` carries free text for the
/// legacy "Other" option.
export class SpecializationSelectionDto {
  @IsUUID()
  specializationId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  note?: string;
}

/// Self-reported active client count for a location (legacy numberOfClients).
export class LocationCaseloadDto {
  @IsString()
  @MaxLength(80)
  locationLabel!: string;

  @IsInt()
  @Min(0)
  clientCount!: number;
}

export class UpdateProfessionalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsEnum(ProfessionType)
  professionType?: ProfessionType;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bmdcRegistrationNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  graduationBatch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  workplace?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  educationSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  feeAmount?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  feeCurrency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxWeeklyClients?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  avgWeeklyClients?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referralSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsUUID()
  districtId?: string;

  @IsOptional()
  @IsUUID()
  upazilaId?: string;

  @IsOptional()
  @IsUUID()
  unionId?: string;

  // When present, REPLACES the full set of specializations.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SpecializationSelectionDto)
  specializations?: SpecializationSelectionDto[];

  // When present, REPLACES the full weekly availability.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  availability?: AvailabilityWindowDto[];

  // When present, REPLACES the full caseload-by-location set.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LocationCaseloadDto)
  caseloads?: LocationCaseloadDto[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptingNewClients?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnboardingComplete?: boolean;
}
