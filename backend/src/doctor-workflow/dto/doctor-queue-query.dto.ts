import { IsOptional, IsString, MinLength } from "class-validator";

export class DoctorQueueQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  doctorId?: string;
}
