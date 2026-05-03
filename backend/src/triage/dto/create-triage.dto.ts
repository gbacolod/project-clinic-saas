import { TriagePriority } from "@prisma/client";
import { IsEnum, IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTriageDto {
  @IsString()
  @MinLength(1)
  patientId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nurseId?: string;

  @IsOptional()
  @IsEnum(TriagePriority)
  priority?: TriagePriority;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsObject()
  vitals?: Record<string, unknown>;
}
