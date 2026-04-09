import { usersRepository } from "@/repositories/users.repository";
import { ROLES } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const usersService = {
  async getAllUsers() {
    return usersRepository.findAll();
  },

  async getApplicants() {
    return usersRepository.findApplicants();
  },

  async getInternalUsers() {
    return usersRepository.findInternalStaff();
  },

  async getUserById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  async changeRole(
    targetUserId: string,
    newRole: Role,
    requestingUserId: string,
    requestingRole: Role,
  ) {
    if (targetUserId === requestingUserId) {
      throw new Error("You cannot change your own role");
    }
    if (newRole === "super_admin" && requestingRole !== "super_admin") {
      throw new Error("Only a super admin can assign the super admin role");
    }
    if (!ROLES.includes(newRole)) {
      throw new Error("Invalid role");
    }
    return usersRepository.updateRole(targetUserId, newRole);
  },

  async deactivateUser(targetUserId: string, requestingUserId: string) {
    if (targetUserId === requestingUserId) {
      throw new Error("You cannot deactivate your own account");
    }
    return usersRepository.setActive(targetUserId, false);
  },

  async reactivateUser(targetUserId: string) {
    return usersRepository.setActive(targetUserId, true);
  },

  async updateUser(targetUserId: string, data: { fullName: string }) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw new Error("User not found");
    return usersRepository.update(targetUserId, {
      fullName: data.fullName.trim(),
    });
  },

  async sendPasswordReset(targetUserId: string) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw new Error("User not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60);

    await usersRepository.update(targetUserId, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.fullName},</p>
        <p>An administrator has requested a password reset for your account.</p>
        <p>Click the link below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not expect this, please contact your administrator.</p>
      `,
    });

    return { sent: true };
  },

  async setTemporaryPassword(targetUserId: string, temporaryPassword: string) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw new Error("User not found");

    if (temporaryPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    await usersRepository.update(targetUserId, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { updated: true };
  },

  async createInternalUser(
    data: {
      fullName: string;
      email: string;
      role: Role;
      temporaryPassword: string;
    },
    requestingRole: Role,
  ) {
    // Only internal roles can be created here
    if (data.role === "applicant") {
      throw new Error("Cannot create an applicant account from here");
    }

    // Only super_admin can create a super_admin
    if (data.role === "super_admin" && requestingRole !== "super_admin") {
      throw new Error("Only a super admin can create a super admin account");
    }

    // Validate role
    if (!ROLES.includes(data.role)) {
      throw new Error("Invalid role");
    }

    // Check email is not already in use
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("A user with this email address already exists");
    }

    if (data.temporaryPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const passwordHash = await bcrypt.hash(data.temporaryPassword, 12);

    return usersRepository.create({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      passwordHash,
      emailVerified: true, // admin-created accounts are pre-verified
      isActive: true,
    });
  },
};
