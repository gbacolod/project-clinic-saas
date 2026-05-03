import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

type PrismaKnownError = {
  code?: string;
};

export function handlePrismaError(error: unknown, resourceName: string): never {
  if (isPrismaKnownError(error) && error.code === "P2025") {
    throw new NotFoundException(`${resourceName} not found`);
  }

  if (isPrismaKnownError(error) && error.code === "P2002") {
    throw new ConflictException(`${resourceName} already exists`);
  }

  if (isPrismaKnownError(error) && error.code === "P2003") {
    throw new BadRequestException(`Invalid related record for ${resourceName}`);
  }

  throw error;
}

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return typeof error === "object" && error !== null && "code" in error;
}
