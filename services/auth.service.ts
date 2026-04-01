import bcrypt from "bcryptjs";
import { usersRepository } from "@/repositories/users.repository";
import { sendEmail } from "@/lib/email";
import { VerifyEmailTemplate } from "@/emails/verify-email";
import { generateToken } from "@/lib/utils/tokens";
import { getResetTokenExpiry } from "@/lib/utils/tokens";
import { isTokenExpired } from "@/lib/utils/tokens";
import { ResetPasswordTemplate } from "@/emails/reset-password";
import { createElement } from "react";

export const authService = {
  async register(data: { fullName: string; email: string; password: string }) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) throw new Error("An account with this email already exists");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const verificationToken = generateToken();

    const user = await usersRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      verificationToken,
      emailVerified: false,
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Permit Portal account",
      template: VerifyEmailTemplate({
        fullName: user.fullName,
        verificationUrl,
      }),
    });

    return user;
  },

  async verifyEmail(token: string) {
    const user = await usersRepository.findByVerificationToken(token);
    if (!user) throw new Error("Invalid or expired verification link");
    if (user.emailVerified) throw new Error("Email already verified");

    await usersRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null,
    });

    return user;
  },

  async validateLoginEligibility(email: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");
    if (!user.emailVerified) {
      throw new Error("Please verify your email address before signing in");
    }
    return user;
  },

  async resetPassword(token: string, newPassword: string) {
    // 1. Find user by reset token
    const user = await usersRepository.findByResetToken(token);
    if (!user) throw new Error("Invalid or expired reset link");

    // 2. Check token has not expired
    if (isTokenExpired(user.resetTokenExpires)) {
      throw new Error("This reset link has expired. Please request a new one.");
    }

    // 3. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 4. Update password + clear reset token
    await usersRepository.update(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    });

    return user;
  },

  async requestPasswordReset(email: string) {
    // 1. Find user — do not reveal whether email exists
    const user = await usersRepository.findByEmail(email);
    if (!user) return; // Silent — do not throw

    // 2. Generate reset token + expiry
    const resetToken = generateToken();
    const resetTokenExpires = getResetTokenExpiry();

    // 3. Save token to DB
    await usersRepository.update(user.id, {
      resetToken,
      resetTokenExpires,
    });

    // 4. Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Permit Portal password",
      template: ResetPasswordTemplate({
        fullName: user.fullName,
        resetUrl,
      }),
    });
  },
};
