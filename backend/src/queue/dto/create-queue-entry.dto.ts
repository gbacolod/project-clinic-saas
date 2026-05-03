import { QueueStatus, TriagePriority } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateQueueEntryDto {
  @IsString()
  @MinLength(1)
  patientId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  triageId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  assignedDoctorId?: string;

  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @IsOptional()
  @IsEnum(TriagePriority)
  priority?: TriagePriority;

  @IsOptional()
  @IsDateString()
  queuedAt?: string;
}
