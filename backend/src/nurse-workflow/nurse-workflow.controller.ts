import { Body, Controller, Post } from "@nestjs/common";
import { CreateNurseCheckInDto } from "./dto/create-nurse-check-in.dto";
import { NurseWorkflowService } from "./nurse-workflow.service";

@Controller("nurse-workflow")
export class NurseWorkflowController {
  constructor(private readonly nurseWorkflowService: NurseWorkflowService) {}

  @Post("check-ins")
  createCheckIn(@Body() dto: CreateNurseCheckInDto) {
    return this.nurseWorkflowService.createCheckIn(dto);
  }
}
