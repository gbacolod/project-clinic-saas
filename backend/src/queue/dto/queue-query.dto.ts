import { QueueStatus, TriagePriority } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QueueQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  patientId?: string;

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
}
