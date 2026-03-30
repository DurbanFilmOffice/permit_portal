import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { permits } from './permits'

// comment_added = new applicant-facing comment (permit_comments)
// note_added    = new internal note (application_notes) — notifies assigned users only
export const notificationTypeEnum = pgEnum('notification_type', [
  'comment_added',
  'note_added',
  'status_changed',
  'permit_submitted',
  'permit_approved',
  'permit_rejected',
])

export const portalNotifications = pgTable('portal_notifications', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  type:      notificationTypeEnum('type').notNull(),
  title:     text('title').notNull(),
  body:      text('body'),
  permitId:  uuid('permit_id').references(() => permits.id, { onDelete: 'set null' }),
  isRead:    boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PortalNotification    = typeof portalNotifications.$inferSelect
export type NewPortalNotification = typeof portalNotifications.$inferInsert