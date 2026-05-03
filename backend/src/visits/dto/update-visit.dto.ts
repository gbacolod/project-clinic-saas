import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateVisitDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  queueEntryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  diagnosis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  treatment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
