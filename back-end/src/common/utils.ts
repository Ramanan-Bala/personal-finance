import { eq } from 'drizzle-orm';
import { accounts } from '../db/schema';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function stripTimestamps<T extends Record<string, any>>(
  obj: T,
): Omit<T, 'createdAt' | 'updatedAt'> {
  const { createdAt, updatedAt, ...rest } = obj;
  return rest;
}

export function sanitizeUser<T extends Record<string, any>>(
  user: T,
): Omit<T, 'passwordHash' | 'createdAt' | 'updatedAt'> {
  const { passwordHash, createdAt, updatedAt, ...rest } = user;
  return rest;
}

export function generateOTP(): string {
  return Math.floor(
    10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1),
  ).toString();
}

export function computeOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export async function adjustAccountBalance(
  tx: any,
  accountId: string,
  delta: number,
): Promise<void> {
  const account = await tx.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });
  if (!account) throw new Error('Account not found');

  const newBalance = Number(account.openingBalance) + delta;
  await tx
    .update(accounts)
    .set({ openingBalance: newBalance.toString() })
    .where(eq(accounts.id, accountId));
}
