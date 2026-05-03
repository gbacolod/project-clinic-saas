import { Type } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { TriagePriority } from "@prisma/client";

export class NurseWorkflowPatientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}

export class CreateNurseCheckInDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  patientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NurseWorkflowPatientDto)
  patient?: NurseWorkflowPatientDto;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nurseId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  chiefComplaint!: string;

  @IsEnum(TriagePriority)
  priority!: TriagePriority;

  @IsOptional()
  @IsObject()
  vitals?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
