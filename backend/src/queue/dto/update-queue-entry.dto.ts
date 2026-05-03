import { QueueStatus, TriagePriority } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateQueueEntryDto {
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

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
