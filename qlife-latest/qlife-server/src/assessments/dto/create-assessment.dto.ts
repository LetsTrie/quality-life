import { IsString, MinLength } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  @MinLength(1)
  instrumentSlug!: string;
}

