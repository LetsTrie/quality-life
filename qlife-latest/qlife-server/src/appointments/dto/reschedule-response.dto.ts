import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/// A client's response to a professional-proposed reschedule: either accept the
/// proposed time, or counter with a different one.
export class RescheduleResponseDto {
  @IsIn(['ACCEPT', 'COUNTER'])
  action!: 'ACCEPT' | 'COUNTER';

  @IsOptional()
  @IsString()
  requestedStartAt?: string; // ISO datetime, required for COUNTER

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userMessage?: string;
}
