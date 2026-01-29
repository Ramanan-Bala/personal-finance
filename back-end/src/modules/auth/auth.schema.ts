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

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export const verify2faSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Verify2faInput = z.infer<typeof verify2faSchema>;
