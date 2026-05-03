import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { DoctorWorkflowModule } from "./doctor-workflow/doctor-workflow.module";
import { NurseWorkflowModule } from "./nurse-workflow/nurse-workflow.module";
import { PatientsModule } from "./patients/patients.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QueueModule } from "./queue/queue.module";
import { ReportsModule } from "./reports/reports.module";
import { TriageModule } from "./triage/triage.module";
import { UsersModule } from "./users/users.module";
import { VisitsModule } from "./visits/visits.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    NurseWorkflowModule,
    DoctorWorkflowModule,
    TriageModule,
    QueueModule,
    VisitsModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
