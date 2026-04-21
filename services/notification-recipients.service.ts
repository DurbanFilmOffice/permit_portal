import { notificationRecipientsRepository } from "@/repositories/notification-recipients.repository";
import { usersRepository } from "@/repositories/users.repository";

export const notificationRecipientsService = {
  async getAll() {
    return notificationRecipientsRepository.findAll();
  },

  // Add an external email address as a recipient
  async add(data: { email: string; name: string; role?: string }) {
    const all = await notificationRecipientsRepository.findAll();

    const exists = all.find(
      (r) => r.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (exists) {
      throw new Error("This email address is already a notification recipient");
    }

    return notificationRecipientsRepository.create({
      userId: null,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role: data.role?.trim() ?? null,
      isActive: true,
    });
  },

  // Add an existing portal user as a recipient
  async addPortalUser(userId: string) {
    const all = await notificationRecipientsRepository.findAll();

    const alreadyAdded = all.find((r) => r.userId === userId);
    if (alreadyAdded) {
      throw new Error("This user is already a notification recipient");
    }

    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isActive) {
      throw new Error("Cannot add an inactive user as a recipient");
    }

    return notificationRecipientsRepository.create({
      userId: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      isActive: true,
    });
  },

  async toggleActive(id: string, isActive: boolean) {
    return notificationRecipientsRepository.update(id, { isActive });
  },

  async remove(id: string) {
    return notificationRecipientsRepository.delete(id);
  },

  async update(id: string, data: { name?: string; role?: string }) {
    return notificationRecipientsRepository.update(id, data);
  },

  async getFiltered(
    filters: {
      search?: string;
      status?: string;
    },
    pagination: { limit: number; offset: number },
  ) {
    const [rows, total] = await Promise.all([
      notificationRecipientsRepository.findWithFilters(filters, pagination),
      notificationRecipientsRepository.countWithFilters(filters),
    ]);
    return { rows, total };
  },
};
