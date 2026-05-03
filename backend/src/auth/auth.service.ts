import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    throw new NotImplementedException("Authentication strategy is not configured yet.");
  }
}
