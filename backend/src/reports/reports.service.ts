import { Injectable } from "@nestjs/common";
import { Prisma, QueueStatus, TriagePriority } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CommonDiagnosesQueryDto } from "./dto/common-diagnoses-query.dto";
import { ReportsQueryDto } from "./dto/reports-query.dto";

type DailyTotalRow = {
  day: string;
  total: number;
};

type CommonDiagnosisRow = {
  diagnosis: string;
  total: number;
};

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

  getPatientsPerDay(query: ReportsQueryDto) {
    const range = this.getDateSqlRange("created_at", query);

    return this.prisma.$queryRaw<DailyTotalRow[]>(Prisma.sql`
      SELECT
        to_char(created_at::date, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS total
      FROM patients
      WHERE 1 = 1
        ${range}
      GROUP BY created_at::date
      ORDER BY created_at::date ASC
    `);
  }

  getConsultationsPerDay(query: ReportsQueryDto) {
    const range = this.getDateSqlRange("started_at", query);

    return this.prisma.$queryRaw<DailyTotalRow[]>(Prisma.sql`
      SELECT
        to_char(started_at::date, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS total
      FROM visits
      WHERE 1 = 1
        ${range}
      GROUP BY started_at::date
      ORDER BY started_at::date ASC
    `);
  }

  getCommonDiagnoses(query: CommonDiagnosesQueryDto) {
    const range = this.getDateSqlRange("started_at", query);

    return this.prisma.$queryRaw<CommonDiagnosisRow[]>(Prisma.sql`
      SELECT
        lower(trim(diagnosis)) AS diagnosis,
        COUNT(*)::int AS total
      FROM visits
      WHERE diagnosis IS NOT NULL
        AND trim(diagnosis) <> ''
        ${range}
      GROUP BY lower(trim(diagnosis))
      ORDER BY total DESC, diagnosis ASC
      LIMIT ${query.limit}
    `);
  }

  private getDateRange(from?: string, to?: string) {
    if (!from && !to) {
      return undefined;
    }

    return {
      gte: from ? this.parseDateBoundary(from, "start") : undefined,
      lte: to ? this.parseDateBoundary(to, "end") : undefined,
    };
  }

  private getDateSqlRange(columnName: "created_at" | "started_at", query: ReportsQueryDto) {
    const column = Prisma.raw(columnName);
    const from = query.from ? this.parseDateBoundary(query.from, "start") : undefined;
    const to = query.to ? this.parseDateBoundary(query.to, "end") : undefined;

    return Prisma.sql`
      ${from ? Prisma.sql`AND ${column} >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND ${column} <= ${to}` : Prisma.empty}
    `;
  }

  private parseDateBoundary(value: string, boundary: "start" | "end") {
    if (value.includes("T")) {
      return new Date(value);
    }

    return new Date(`${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`);
  }
}
