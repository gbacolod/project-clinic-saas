import { Injectable } from "@nestjs/common";
import { QueueStatus, TriagePriority } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ReportsQueryDto } from "./dto/reports-query.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: ReportsQueryDto) {
    const startedAt = this.getDateRange(query.from, query.to);

    const [
      totalPatients,
      waitingQueue,
      inConsultationQueue,
      completedQueue,
      emergencyTriages,
      urgentTriages,
      regularTriages,
      followUpTriages,
      totalVisits,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.queueEntry.count({ where: { status: QueueStatus.waiting } }),
      this.prisma.queueEntry.count({ where: { status: QueueStatus.in_consultation } }),
      this.prisma.queueEntry.count({ where: { status: QueueStatus.completed } }),
      this.prisma.triage.count({ where: { priority: TriagePriority.emergency } }),
      this.prisma.triage.count({ where: { priority: TriagePriority.urgent } }),
      this.prisma.triage.count({ where: { priority: TriagePriority.regular } }),
      this.prisma.triage.count({ where: { priority: TriagePriority.follow_up } }),
      this.prisma.visit.count({ where: startedAt ? { startedAt } : undefined }),
    ]);

    return {
      patients: {
        total: totalPatients,
      },
      queue: {
        waiting: waitingQueue,
        inConsultation: inConsultationQueue,
        completed: completedQueue,
      },
      triage: {
        emergency: emergencyTriages,
        urgent: urgentTriages,
        regular: regularTriages,
        followUp: followUpTriages,
      },
      visits: {
        total: totalVisits,
      },
    };
  }

  private getDateRange(from?: string, to?: string) {
    if (!from && !to) {
      return undefined;
    }

    return {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
  }
}
