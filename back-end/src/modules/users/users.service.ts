import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { sanitizeUser } from '../../common/utils';
import { UpdateProfileInput } from './users.schema';

export class UsersService {
  async getProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { createdAt: false, updatedAt: false },
    });

    return user ? sanitizeUser(user) : null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser ? sanitizeUser(updatedUser) : null;
  }
}

export const usersService = new UsersService();
