import { ArrayMinSize, IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class AssignAssessmentDto {
  @IsArray()
  @ArrayMinSize(1)
  instrumentSlugs!: string[];

  // Optional due date (ISO). Stored on assessment.
  @IsOptional()
  @IsString()
  dueAt?: string;
}

