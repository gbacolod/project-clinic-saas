import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTriageDto } from "./dto/create-triage.dto";
import { TriageQueryDto } from "./dto/triage-query.dto";
import { UpdateTriageDto } from "./dto/update-triage.dto";

@Injectable()
export class TriageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTriageDto) {
    try {
      return await this.prisma.triage.create({
        data: dto as Prisma.TriageUncheckedCreateInput,
        include: {
          patient: true,
          nurse: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Triage record");
    }
  }

  findAll(query: TriageQueryDto) {
    return this.prisma.triage.findMany({
      where: {
        patientId: query.patientId,
        nurseId: query.nurseId,
        priority: query.priority,
      },
      include: {
        patient: true,
        nurse: true,
      },
      orderBy: { createdAt: "desc" },
      skip: query.offset,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const triage = await this.prisma.triage.findUnique({
      where: { id },
      include: {
        patient: true,
        nurse: true,
        queueEntries: true,
      },
    });

    if (!triage) {
      throw new NotFoundException("Triage record not found");
    }

    return triage;
  }

  async update(id: string, dto: UpdateTriageDto) {
    try {
      return await this.prisma.triage.update({
        where: { id },
        data: dto as Prisma.TriageUncheckedUpdateInput,
        include: {
          patient: true,
          nurse: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Triage record");
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.triage.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, "Triage record");
    }
  }
}
