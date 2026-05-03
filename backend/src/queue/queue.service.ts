import { Injectable, NotFoundException } from "@nestjs/common";
import { TriagePriority } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQueueEntryDto } from "./dto/create-queue-entry.dto";
import { QueueQueryDto } from "./dto/queue-query.dto";
import { UpdateQueueEntryDto } from "./dto/update-queue-entry.dto";

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQueueEntryDto) {
    try {
      return await this.prisma.queueEntry.create({
        data: await this.toCreateData(dto),
        include: {
          assignedDoctor: true,
          patient: true,
          triage: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Queue entry");
    }
  }

  findAll(query: QueueQueryDto) {
    return this.prisma.queueEntry.findMany({
      where: {
        assignedDoctorId: query.assignedDoctorId,
        patientId: query.patientId,
        priority: query.priority,
        status: query.status,
      },
      include: {
        assignedDoctor: true,
        patient: true,
        triage: true,
        visit: true,
      },
      orderBy: [{ priority: "asc" }, { queuedAt: "asc" }],
      skip: query.offset,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { id },
      include: {
        assignedDoctor: true,
        patient: true,
        triage: true,
        visit: true,
      },
    });

    if (!entry) {
      throw new NotFoundException("Queue entry not found");
    }

    return entry;
  }

  async update(id: string, dto: UpdateQueueEntryDto) {
    try {
      return await this.prisma.queueEntry.update({
        where: { id },
        data: this.toUpdateData(dto),
        include: {
          assignedDoctor: true,
          patient: true,
          triage: true,
          visit: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Queue entry");
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.queueEntry.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, "Queue entry");
    }
  }

  private async toCreateData(dto: CreateQueueEntryDto): Promise<Prisma.QueueEntryUncheckedCreateInput> {
    const triagePriority = dto.triageId ? await this.findTriagePriority(dto.triageId) : undefined;

    return {
      ...dto,
      priority: dto.priority ?? triagePriority ?? TriagePriority.regular,
      queuedAt: dto.queuedAt ? new Date(dto.queuedAt) : undefined,
    };
  }

  private toUpdateData(dto: UpdateQueueEntryDto): Prisma.QueueEntryUncheckedUpdateInput {
    return {
      ...dto,
      queuedAt: dto.queuedAt ? new Date(dto.queuedAt) : undefined,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    };
  }

  private async findTriagePriority(triageId: string) {
    const triage = await this.prisma.triage.findUnique({
      where: { id: triageId },
      select: { priority: true },
    });

    return triage?.priority;
  }
}
