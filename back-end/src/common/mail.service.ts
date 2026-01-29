export class MailService {
  async sendOTP(email: string, otp: string) {
    console.log(`[MAIL] Sending OTP ${otp} to ${email}`);
    // In production, integrate with SendGrid, Nodemailer, etc.
  }

  async sendPasswordResetOTP(email: string, otp: string) {
    console.log(`[MAIL] Sending Password Reset OTP ${otp} to ${email}`);
  }
}

export const mailService = new MailService();
