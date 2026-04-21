import { db } from "@/lib/db";
import { notificationRecipients } from "@/db/schema/notification-recipients";
import { eq, asc, count, and, ilike, or } from "drizzle-orm";
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

  // Paginated + filtered query for recipients table
  findWithFilters: async (
    filters: {
      search?: string;
      status?: string;
    },
    pagination: { limit: number; offset: number },
  ) => {
    const conditions = buildConditions(filters);
    return db
      .select()
      .from(notificationRecipients)
      .where(conditions)
      .orderBy(asc(notificationRecipients.name))
      .limit(pagination.limit)
      .offset(pagination.offset);
  },

  // Count for pagination meta
  countWithFilters: async (filters: { search?: string; status?: string }) => {
    const conditions = buildConditions(filters);
    return db
      .select({ count: count() })
      .from(notificationRecipients)
      .where(conditions)
      .then((r) => Number(r[0]?.count ?? 0));
  },
};

// Private helper — not exported
function buildConditions(filters: { search?: string; status?: string }) {
  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        ilike(notificationRecipients.name, `%${filters.search}%`),
        ilike(notificationRecipients.email, `%${filters.search}%`),
      ),
    );
  }

  if (filters.status === "active") {
    conditions.push(eq(notificationRecipients.isActive, true));
  } else if (filters.status === "inactive") {
    conditions.push(eq(notificationRecipients.isActive, false));
  }

  return conditions.length ? and(...conditions) : undefined;
}
