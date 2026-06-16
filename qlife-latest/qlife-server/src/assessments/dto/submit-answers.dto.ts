import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';

class AnswerItemDto {
  @IsUUID()
  questionId!: string;

  @IsUUID()
  selectedOptionId!: string;
}

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];

  // Optional client note (not stored today; reserved for audit payload later).
  @IsString()
  @MinLength(0)
  note?: string;
}

