import { Controller, Get, Query } from "@nestjs/common";
import { CommonDiagnosesQueryDto } from "./dto/common-diagnoses-query.dto";
import { ReportsQueryDto } from "./dto/reports-query.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  getSummary(@Query() query: ReportsQueryDto) {
    return this.reportsService.getSummary(query);
  }

  @Get("patients-per-day")
  getPatientsPerDay(@Query() query: ReportsQueryDto) {
    return this.reportsService.getPatientsPerDay(query);
  }

  @Get("consultations-per-day")
  getConsultationsPerDay(@Query() query: ReportsQueryDto) {
    return this.reportsService.getConsultationsPerDay(query);
  }

  @Get("common-diagnoses")
  getCommonDiagnoses(@Query() query: CommonDiagnosesQueryDto) {
    return this.reportsService.getCommonDiagnoses(query);
  }
}
