import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CompleteConsultationDto } from "./dto/complete-consultation.dto";
import { DoctorQueueQueryDto } from "./dto/doctor-queue-query.dto";
import { StartConsultationDto } from "./dto/start-consultation.dto";
import { DoctorWorkflowService } from "./doctor-workflow.service";

@Controller("doctor-workflow")
export class DoctorWorkflowController {
  constructor(private readonly doctorWorkflowService: DoctorWorkflowService) {}

  @Get("next-patient")
  getNextPatient(@Query() query: DoctorQueueQueryDto) {
    return this.doctorWorkflowService.getNextPatient(query);
  }

  @Post("consultations/start")
  startConsultation(@Body() dto: StartConsultationDto) {
    return this.doctorWorkflowService.startConsultation(dto);
  }

  @Patch("consultations/:visitId/complete")
  completeConsultation(@Param("visitId") visitId: string, @Body() dto: CompleteConsultationDto) {
    return this.doctorWorkflowService.completeConsultation(visitId, dto);
  }
}
