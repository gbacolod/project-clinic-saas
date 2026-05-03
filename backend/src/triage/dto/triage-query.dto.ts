import { TriagePriority } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class TriageQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  patientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nurseId?: string;

  @IsOptional()
  @IsEnum(TriagePriority)
  priority?: TriagePriority;
}
