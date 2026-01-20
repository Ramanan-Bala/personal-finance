import { Injectable } from "@nestjs/common";
import { PrismaClient, RefreshToken } from "@prisma/client";

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(tokenId: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
