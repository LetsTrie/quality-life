import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class AssignAssessmentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instrumentSlugs!: string[];

  // Optional due date (ISO). Stored on assessment.
  @IsOptional()
  @IsString()
  dueAt?: string;
}

