import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RequestAppointmentDto {
  @IsUUID()
  professionalProfileId!: string;

  @IsString()
  requestedStartAt!: string; // ISO datetime

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requestMessage?: string;

  @IsOptional()
  @IsBoolean()
  profileShareGranted?: boolean;
}

