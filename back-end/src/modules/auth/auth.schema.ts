import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string('Name is required').min(2),
  password: z.string('Password is required').min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string('Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string('Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
