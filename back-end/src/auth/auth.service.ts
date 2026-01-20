import { AppException } from '@/common/exceptions/app.exception';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthRepository } from './repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      AppException.conflict('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    // Generate tokens
    return this.generateTokens(user.id);
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      AppException.badRequest('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      AppException.badRequest('Invalid email or password');
    }

    // Generate tokens
    return this.generateTokens(user.id, user.name!, user.email);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokensDto> {
    // Find and validate refresh token
    const storedToken = await this.authRepository.findRefreshTokenByToken(
      refreshToken,
    );

    if (!storedToken || storedToken.revokedAt) {
      AppException.badRequest('Invalid or revoked refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      AppException.badRequest('Refresh token expired');
    }

    // Verify JWT
    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      AppException.badRequest('Invalid refresh token');
    }

    // Revoke old token and generate new ones
    await this.authRepository.revokeRefreshToken(storedToken.id);
    return this.generateTokens(storedToken.userId);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const storedToken = await this.authRepository.findRefreshTokenByToken(
        refreshToken,
      );
      if (storedToken) {
        await this.authRepository.revokeRefreshToken(storedToken.id);
      }
    } else {
      // Revoke all tokens for user
      await this.authRepository.revokeAllUserRefreshTokens(userId);
    }
  }

  private async generateTokens(
    userId: string,
    name?: string,
    email?: string,
  ): Promise<AuthTokensDto> {
    const accessToken = this.jwtService.sign(
      { sub: userId } as any,
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRY || '15m',
      } as any,
    );

    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
    const refreshToken = this.jwtService.sign(
      { sub: userId } as any,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: refreshExpiresIn,
      } as any,
    );

    // Calculate expiry time
    const expiresAtValue = this.parseExpiresIn(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiresAtValue);

    // Store refresh token
    await this.authRepository.createRefreshToken(
      userId,
      refreshToken,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      name: name != null ? name : '',
      email: email != null ? email : '',
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiresIn format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid time unit');
    }
  }
}
