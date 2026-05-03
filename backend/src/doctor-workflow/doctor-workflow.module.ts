import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DoctorWorkflowController } from "./doctor-workflow.controller";
import { DoctorWorkflowService } from "./doctor-workflow.service";

@Module({
  imports: [PrismaModule],
  controllers: [DoctorWorkflowController],
  providers: [DoctorWorkflowService],
})
export class DoctorWorkflowModule {}
