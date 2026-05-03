import { Injectable, NotFoundException } from "@nestjs/common";
import { handlePrismaError } from "../common/prisma-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersQueryDto } from "./dto/users-query.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: dto,
        select: userSelect,
      });
    } catch (error) {
      handlePrismaError(error, "User");
    }
  }

  findAll(query: UsersQueryDto) {
    return this.prisma.user.findMany({
      where: query.role ? { role: query.role } : undefined,
      orderBy: { createdAt: "desc" },
      skip: query.offset,
      take: query.limit,
      select: userSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
        select: userSelect,
      });
    } catch (error) {
      handlePrismaError(error, "User");
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, "User");
    }
  }
}
