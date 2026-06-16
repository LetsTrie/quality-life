import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewVerificationDto {
  @IsIn(['APPROVED', 'REJECTED', 'REVOKED'])
  decision!: 'APPROVED' | 'REJECTED' | 'REVOKED';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  decisionNote?: string;
}

