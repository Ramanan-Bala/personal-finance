import { Injectable } from "@nestjs/common";
import { PrismaClient, User } from "@prisma/client";

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }
}
