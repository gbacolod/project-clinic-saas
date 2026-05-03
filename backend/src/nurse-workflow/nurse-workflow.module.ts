import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { NurseWorkflowController } from "./nurse-workflow.controller";
import { NurseWorkflowService } from "./nurse-workflow.service";

@Module({
  imports: [PrismaModule],
  controllers: [NurseWorkflowController],
  providers: [NurseWorkflowService],
})
export class NurseWorkflowModule {}
