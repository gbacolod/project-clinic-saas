import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { VisitsQueryDto } from "./dto/visits-query.dto";

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVisitDto) {
    try {
      return await this.prisma.visit.create({
        data: this.toCreateData(dto),
        include: {
          doctor: true,
          patient: true,
          queueEntry: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Visit");
    }
  }

  findAll(query: VisitsQueryDto) {
    return this.prisma.visit.findMany({
      where: {
        doctorId: query.doctorId,
        patientId: query.patientId,
      },
      include: {
        doctor: true,
        patient: true,
        queueEntry: true,
      },
      orderBy: { startedAt: "desc" },
      skip: query.offset,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
        queueEntry: true,
      },
    });

    if (!visit) {
      throw new NotFoundException("Visit not found");
    }

    return visit;
  }

  async update(id: string, dto: UpdateVisitDto) {
    try {
      return await this.prisma.visit.update({
        where: { id },
        data: this.toUpdateData(dto),
        include: {
          doctor: true,
          patient: true,
          queueEntry: true,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Visit");
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.visit.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, "Visit");
    }
  }

  private toCreateData(dto: CreateVisitDto): Prisma.VisitUncheckedCreateInput {
    return {
      ...dto,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
      endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
    };
  }

  private toUpdateData(dto: UpdateVisitDto): Prisma.VisitUncheckedUpdateInput {
    return {
      ...dto,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
      endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
    };
  }
}
