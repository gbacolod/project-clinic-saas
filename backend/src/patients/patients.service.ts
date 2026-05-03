import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { PatientsQueryDto } from "./dto/patients-query.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto) {
    try {
      return await this.prisma.patient.create({
        data: {
          ...dto,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Patient");
    }
  }

  findAll(query: PatientsQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.PatientWhereInput | undefined = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined;

    return this.prisma.patient.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: query.offset,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    try {
      return await this.prisma.patient.update({
        where: { id },
        data: {
          ...dto,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        },
      });
    } catch (error) {
      handlePrismaError(error, "Patient");
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.patient.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, "Patient");
    }
  }
}
