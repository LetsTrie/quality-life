import {
  InstrumentCategory,
  OutcomeAction,
  QuestionType,
  ScoringMethod,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AuthorOptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  label!: string;

  @IsInt()
  value!: number;

  @IsNumber()
  weight!: number;
}

export class AuthorQuestionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  domain?: string;

  @IsOptional()
  @IsBoolean()
  isReverseScored?: boolean;

  @IsArray()
  @ArrayMinSize(2) // single-choice needs at least two options
  @ValidateNested({ each: true })
  @Type(() => AuthorOptionDto)
  options!: AuthorOptionDto[];
}

export class AuthorBandDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  label!: string;

  @IsInt()
  @Min(0)
  severityRank!: number;

  @IsNumber()
  minScore!: number;

  @IsNumber()
  maxScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(9)
  colorHex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  advice?: string;

  @IsEnum(OutcomeAction)
  recommendedAction!: OutcomeAction;

  @IsOptional()
  @IsUUID()
  recommendedContentId?: string;
}

export class UpsertInstrumentDto {
  // --- Instrument metadata ---
  // slug is required on create, ignored on update (immutable stable key).
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  nameBn?: string;

  @IsEnum(InstrumentCategory)
  category!: InstrumentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSelfAssessable?: boolean;

  // --- Version / scoring ---
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string; // defaults to 'bn'

  @IsEnum(ScoringMethod)
  scoringMethod!: ScoringMethod;

  @IsOptional()
  @IsNumber()
  normalizationMax?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attribution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AuthorQuestionDto)
  questions!: AuthorQuestionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorBandDto)
  bands!: AuthorBandDto[];
}
