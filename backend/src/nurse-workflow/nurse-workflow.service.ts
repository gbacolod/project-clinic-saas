import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { QueueStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNurseCheckInDto, NurseWorkflowPatientDto } from "./dto/create-nurse-check-in.dto";

@Injectable()
export class NurseWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckIn(dto: CreateNurseCheckInDto) {
    if (!dto.patientId && !dto.patient) {
      throw new BadRequestException("Provide an existing patientId or patient details");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const patient = await this.resolvePatient(tx, dto);
        await this.ensurePatientIsNotInActiveQueue(tx, patient.id);

        const triage = await tx.triage.create({
          data: {
            patientId: patient.id,
            nurseId: dto.nurseId,
            priority: dto.priority,
            chiefComplaint: dto.chiefComplaint,
            notes: dto.notes,
            vitals: dto.vitals as Prisma.InputJsonValue | undefined,
          },
        });

        const queueEntry = await tx.queueEntry.create({
          data: {
            patientId: patient.id,
            triageId: triage.id,
            priority: dto.priority,
            status: QueueStatus.waiting,
            queuedAt: new Date(),
          },
          include: {
            assignedDoctor: true,
            patient: true,
            triage: true,
          },
        });

        return {
          patient,
          triage,
          queueEntry,
        };
      });
    } catch (error) {
      handlePrismaError(error, "Nurse check-in");
    }
  }

  private async resolvePatient(tx: Prisma.TransactionClient, dto: CreateNurseCheckInDto) {
    if (dto.patientId) {
      const patient = await tx.patient.findUnique({
        where: { id: dto.patientId },
      });

      if (!patient) {
        throw new NotFoundException("Patient not found");
      }

      return patient;
    }

    return tx.patient.create({
      data: this.toPatientCreateData(dto.patient),
    });
  }

  private async ensurePatientIsNotInActiveQueue(tx: Prisma.TransactionClient, patientId: string) {
    const activeQueueEntry = await tx.queueEntry.findFirst({
      where: {
        patientId,
        status: { in: [QueueStatus.waiting, QueueStatus.in_consultation] },
      },
      select: { id: true },
    });

    if (activeQueueEntry) {
      throw new ConflictException("Patient is already in the active queue");
    }
  }

  private toPatientCreateData(patient?: NurseWorkflowPatientDto): Prisma.PatientUncheckedCreateInput {
    if (!patient) {
      throw new BadRequestException("Patient details are required");
    }

    return {
      ...patient,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
    };
  }
}
