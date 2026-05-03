import { IsString, MaxLength, MinLength, IsOptional } from "class-validator";

export class CompleteConsultationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  diagnosis!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  prescriptionNotes!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
