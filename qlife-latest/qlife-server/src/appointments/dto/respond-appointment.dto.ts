import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RespondAppointmentDto {
  @IsIn(['ACCEPTED', 'DECLINED', 'RESCHEDULE_PROPOSED'])
  action!: 'ACCEPTED' | 'DECLINED' | 'RESCHEDULE_PROPOSED';

  @IsOptional()
  @IsString()
  scheduledStartAt?: string; // ISO datetime

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  professionalMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  meetingLink?: string;
}

