import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import {
  accountGroups,
  accounts,
  categories,
  refreshTokens,
  users,
} from '../../db/schema';
import { LoginInput, RegisterInput } from './auth.schema';

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

    return this.generateTokens(user.id, user.name || '', user.email);
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

    return this.generateTokens(user.id, user.name || '', user.email);
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

    return this.generateTokens(user.id, user.name || '', user.email);
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

  private async generateTokens(userId: string, name: string, email: string) {
    const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRY || '15m',
    } as jwt.SignOptions);

    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
    const refreshToken = jwt.sign(
      { sub: userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: refreshExpiresIn } as jwt.SignOptions,
    );

    const expiresAtValue = this.parseExpiresIn(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiresAtValue);

    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
      updatedAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      name,
      email,
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
