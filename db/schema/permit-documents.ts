import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { permits } from "./permits";

export const permitDocuments = pgTable(
  "permit_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    permitId: uuid("permit_id")
      .notNull()
      .references(() => permits.id),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type"),
    fileSizeBytes: integer("file_size_bytes"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    permitIdIdx: index("permit_documents_permit_id_idx").on(table.permitId),
  }),
);

export type PermitDocument = typeof permitDocuments.$inferSelect;
export type NewPermitDocument = typeof permitDocuments.$inferInsert;
