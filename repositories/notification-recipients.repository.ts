import { db } from "@/lib/db";
import { notificationRecipients } from "@/db/schema/notification-recipients";
import { eq } from "drizzle-orm";
import type { NewNotificationRecipient } from "@/db/schema/notification-recipients";

export const notificationRecipientsRepository = {
  findActive: () =>
    db
      .select()
      .from(notificationRecipients)
      .where(eq(notificationRecipients.isActive, true)),

  findAll: () => db.select().from(notificationRecipients),

  create: (data: NewNotificationRecipient) =>
    db
      .insert(notificationRecipients)
      .values(data)
      .returning()
      .then((r) => r[0]),

  update: (id: string, data: Partial<NewNotificationRecipient>) =>
    db
      .update(notificationRecipients)
      .set(data)
      .where(eq(notificationRecipients.id, id))
      .returning()
      .then((r) => r[0]),

  delete: (id: string) =>
    db.delete(notificationRecipients).where(eq(notificationRecipients.id, id)),
};
