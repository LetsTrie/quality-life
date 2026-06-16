import { IsBoolean, IsOptional } from 'class-validator';

export class MarkViewedDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

