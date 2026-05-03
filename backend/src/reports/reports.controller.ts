import { Controller, Get, Query } from "@nestjs/common";
import { ReportsQueryDto } from "./dto/reports-query.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  getSummary(@Query() query: ReportsQueryDto) {
    return this.reportsService.getSummary(query);
  }
}
