import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { mailService } from '../../common/mail.service';
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

    if (existingUser) {
      throw new Error('Email already in use'); // Handle nicely in controller
    }

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

    const [accountGroup] = await db
      .insert(accountGroups)
      .values({
        userId: user.id,
        name: 'Personal',
        description: 'Personal expenses and savings',
      })
      .returning();

    await db.insert(accounts).values({
      userId: user.id,
      groupId: accountGroup.id,
      name: 'Cash',
      openingBalance: '0',
      description: 'Cash in hand',
    });

    await db.insert(accounts).values({
      userId: user.id,
      groupId: accountGroup.id,
      name: 'Savings',
      openingBalance: '0',
      description: 'Savings account',
    });

    await db.insert(categories).values({
      userId: user.id,
      type: 'INCOME',
      name: 'Salary',
      description: 'Salary income',
    });

    await db.insert(categories).values({
      userId: user.id,
      type: 'EXPENSE',
      name: 'Transport',
      description: 'Transport expenses',
    });

    return this.generateTokens(user);
  }

  async login(input: LoginInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.is2faEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db
        .update(users)
        .set({ otp, otpExpiry, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      await mailService.sendOTP(user.email, otp);
      return { twoFactorRequired: true, email: user.email };
    }

    return this.generateTokens(user);
  }

  async verify2fa(email: string, otp: string) {
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

    // Clear OTP after successful verify
    await db
      .update(users)
      .set({ otp: null, otpExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return this.generateTokens(user);
  }

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't leak user existence? Actually in internal apps it's fine, but better to be generic.
      // For now we just return for simplicity.
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db
      .update(users)
      .set({ otp, otpExpiry, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await mailService.sendPasswordResetOTP(email, otp);
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (
      !user ||
      user.otp !== input.otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      throw new Error('Invalid or expired OTP');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash,
        otp: null,
        otpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  async refreshToken(token: string) {
    // Verify JWT structure first
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch (e) {
      throw new Error('Invalid refresh token');
    }

    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new Error('Invalid or revoked refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token expired');
    }

    // Revoke old token
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    // Get user details for new token
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
      // Revoke all for user (optional based on requirement)
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.userId, userId));
    }
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

    const expiresAtValue = this.parseExpiresIn(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiresAtValue);

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
    // Simple parser matching '7d', '15m' etc.
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7d

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
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export const authService = new AuthService();
