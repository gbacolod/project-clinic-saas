import { IsOptional, IsString, MinLength } from "class-validator";

export class StartConsultationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  queueEntryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  doctorId?: string;
}
