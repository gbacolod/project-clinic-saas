import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { QueueStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CompleteConsultationDto } from "./dto/complete-consultation.dto";
import { DoctorQueueQueryDto } from "./dto/doctor-queue-query.dto";
import { StartConsultationDto } from "./dto/start-consultation.dto";

@Injectable()
export class DoctorWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  getNextPatient(query: DoctorQueueQueryDto) {
    return this.prisma.queueEntry.findFirst({
      where: this.getNextPatientWhere(query.doctorId),
      include: this.queueEntryInclude(),
      orderBy: this.queueOrderBy(),
    });
  }

  async startConsultation(dto: StartConsultationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const queueEntry = dto.queueEntryId
          ? await tx.queueEntry.findUnique({
              where: { id: dto.queueEntryId },
              include: this.queueEntryInclude(),
            })
          : await tx.queueEntry.findFirst({
              where: this.getNextPatientWhere(dto.doctorId),
              include: this.queueEntryInclude(),
              orderBy: this.queueOrderBy(),
            });

        if (!queueEntry) {
          throw new NotFoundException("No waiting patient found");
        }

        if (queueEntry.status !== QueueStatus.waiting) {
          throw new BadRequestException("Queue entry is not waiting");
        }

        const startedAt = new Date();

        const claimedQueueEntry = await tx.queueEntry.updateMany({
          where: {
            id: queueEntry.id,
            status: QueueStatus.waiting,
          },
          data: {
            assignedDoctorId: dto.doctorId ?? queueEntry.assignedDoctorId,
            startedAt,
            status: QueueStatus.in_consultation,
          },
        });

        if (claimedQueueEntry.count === 0) {
          throw new ConflictException("Queue entry has already been claimed");
        }

        const updatedQueueEntry = await tx.queueEntry.findUniqueOrThrow({
          where: { id: queueEntry.id },
          include: this.queueEntryInclude(),
        });

        const visit = await tx.visit.upsert({
          where: { queueEntryId: queueEntry.id },
          create: {
            patientId: queueEntry.patientId,
            queueEntryId: queueEntry.id,
            doctorId: dto.doctorId ?? queueEntry.assignedDoctorId,
            startedAt,
          },
          update: {
            doctorId: dto.doctorId ?? queueEntry.assignedDoctorId,
            startedAt,
          },
          include: this.visitInclude(),
        });

        return {
          queueEntry: updatedQueueEntry,
          visit,
        };
      });
    } catch (error) {
      handlePrismaError(error, "Consultation");
    }
  }

  async completeConsultation(visitId: string, dto: CompleteConsultationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingVisit = await tx.visit.findUnique({
          where: { id: visitId },
          include: {
            queueEntry: true,
          },
        });

        if (!existingVisit) {
          throw new NotFoundException("Visit not found");
        }

        if (!existingVisit.queueEntryId || !existingVisit.queueEntry) {
          throw new BadRequestException("Visit is not linked to a queue entry");
        }

        if (existingVisit.endedAt || existingVisit.queueEntry.status === QueueStatus.completed) {
          throw new BadRequestException("Visit is already completed");
        }

        const completedAt = new Date();

        const visit = await tx.visit.update({
          where: { id: visitId },
          data: {
            diagnosis: dto.diagnosis.trim(),
            prescriptionNotes: dto.prescriptionNotes.trim(),
            notes: dto.notes?.trim() || undefined,
            endedAt: completedAt,
          },
          include: this.visitInclude(),
        });

        const queueEntry = await tx.queueEntry.update({
          where: { id: existingVisit.queueEntryId },
          data: {
            completedAt,
            status: QueueStatus.completed,
          },
          include: this.queueEntryInclude(),
        });

        return {
          queueEntry,
          visit,
        };
      });
    } catch (error) {
      handlePrismaError(error, "Consultation");
    }
  }

  private getNextPatientWhere(doctorId?: string): Prisma.QueueEntryWhereInput {
    return {
      status: QueueStatus.waiting,
      OR: doctorId ? [{ assignedDoctorId: doctorId }, { assignedDoctorId: null }] : undefined,
    };
  }

  private queueOrderBy(): Prisma.QueueEntryOrderByWithRelationInput[] {
    return [{ priority: "asc" }, { queuedAt: "asc" }];
  }

  private queueEntryInclude() {
    return {
      assignedDoctor: true,
      patient: {
        include: {
          visits: {
            orderBy: { startedAt: "desc" as const },
            take: 5,
          },
        },
      },
      triage: true,
      visit: true,
    };
  }

  private visitInclude() {
    return {
      doctor: true,
      patient: true,
      queueEntry: {
        include: {
          triage: true,
        },
      },
    };
  }
}
