import { IsOptional, IsString, MinLength } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class VisitsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  patientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  doctorId?: string;
}
