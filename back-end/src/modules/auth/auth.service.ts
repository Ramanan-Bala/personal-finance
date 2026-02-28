import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { mailService } from '../../common/mail.service';
import { computeOtpExpiry, generateOTP } from '../../common/utils';
import { db } from '../../db';
import {
  accountGroups,
  accounts,
  categories,
  refreshTokens,
  User,
  users,
} from '../../db/schema';
import { LoginInput, RegisterInput, ResetPasswordInput } from './auth.schema';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existingUser) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        passwordHash,
        updatedAt: new Date(),
      })
      .returning();

    await this.seedDefaultData(user.id);
    return this.generateTokens(user);
  }

  async login(input: LoginInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) throw new Error('Invalid email or password');

    if (user.is2faEnabled) {
      await this.sendOtpToUser(user.id, user.email);
      return { twoFactorRequired: true, email: user.email };
    }

    return this.generateTokens(user);
  }

  async verify2fa(email: string, otp: string) {
    const user = await this.validateOtp(email, otp);
    await this.clearOtp(user.id);
    return this.generateTokens(user);
  }

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) return;

    const otpCode = generateOTP();
    await db
      .update(users)
      .set({
        otp: otpCode,
        otpExpiry: computeOtpExpiry(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await mailService.sendPasswordResetOTP(email, otpCode);
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await this.validateOtp(input.email, input.otp);
    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await db
      .update(users)
      .set({ passwordHash, otp: null, otpExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  async refreshToken(token: string) {
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch {
      throw new Error('Invalid refresh token');
    }

    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
    });
    if (!storedToken || storedToken.revokedAt)
      throw new Error('Invalid or revoked refresh token');
    if (new Date() > storedToken.expiresAt)
      throw new Error('Refresh token expired');

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, storedToken.userId),
    });
    if (!user) throw new Error('User not found');

    return this.generateTokens(user);
  }

  async logout(userId: string | undefined, token?: string) {
    if (token) {
      const storedToken = await db.query.refreshTokens.findFirst({
        where: eq(refreshTokens.token, token),
      });
      if (storedToken) {
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.id, storedToken.id));
      }
    } else if (userId) {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.userId, userId));
    }
  }

  private async sendOtpToUser(userId: string, email: string) {
    const otpCode = generateOTP();
    await db
      .update(users)
      .set({
        otp: otpCode,
        otpExpiry: computeOtpExpiry(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    await mailService.sendOTP(email, otpCode);
  }

  private async validateOtp(email: string, otp: string): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      throw new Error('Invalid or expired OTP');
    }
    return user;
  }

  private async clearOtp(userId: string) {
    await db
      .update(users)
      .set({ otp: null, otpExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  private async seedDefaultData(userId: string) {
    const [accountGroup] = await db
      .insert(accountGroups)
      .values({
        userId,
        name: 'Personal',
        description: 'Personal expenses and savings',
      })
      .returning();

    await db.insert(accounts).values([
      {
        userId,
        groupId: accountGroup.id,
        name: 'Cash',
        openingBalance: '0',
        description: 'Cash in hand',
      },
      {
        userId,
        groupId: accountGroup.id,
        name: 'Savings',
        openingBalance: '0',
        description: 'Savings account',
      },
    ]);

    await db.insert(categories).values([
      { userId, type: 'INCOME', name: 'Salary', description: 'Salary income' },
      {
        userId,
        type: 'EXPENSE',
        name: 'Transport',
        description: 'Transport expenses',
      },
    ]);
  }

  private async generateTokens(user: User) {
    const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRY || '15m',
    } as jwt.SignOptions);

    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: refreshExpiresIn } as jwt.SignOptions,
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpiresIn(refreshExpiresIn),
    );

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      updatedAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      name: user.name,
      email: user.email,
      is2faEnabled: user.is2faEnabled,
      phone: user.phone,
      currency: user.currency,
      dateFormat: user.dateFormat,
      fontFamily: user.fontFamily,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[match[2]] ?? 7 * 24 * 60 * 60 * 1000);
  }
}

export const authService = new AuthService();
