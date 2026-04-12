import bcrypt from "bcryptjs";
import { usersRepository } from "@/repositories/users.repository";

export const accountService = {
  async updateProfile(userId: string, fullName: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new Error("User not found");

    return usersRepository.update(userId, {
      fullName: fullName.trim(),
    });
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new Error("User not found");
    if (!user.passwordHash) {
      throw new Error("No password set on this account");
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new Error("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    return usersRepository.update(userId, { passwordHash });
  },
};
