import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { UpdateProfileInput } from './users.schema';

export class UsersService {
  async getProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        createdAt: false,
        updatedAt: false,
      },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return null;
    }

    const {
      passwordHash,
      createdAt,
      updatedAt,
      ...userWithoutSensitiveFields
    } = updatedUser as any;
    return userWithoutSensitiveFields;
  }
}

export const usersService = new UsersService();
