ALTER TABLE "application_notes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "permit_comments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "application_notes_permit_id_idx" ON "application_notes" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "email_log_permit_id_idx" ON "email_log" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "permits_user_id_idx" ON "permits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permits_status_idx" ON "permits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "permits_created_at_idx" ON "permits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "permits_user_id_status_idx" ON "permits" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "permit_documents_permit_id_idx" ON "permit_documents" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "permit_status_history_permit_id_idx" ON "permit_status_history" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "permit_status_history_changed_by_idx" ON "permit_status_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "permit_comments_permit_id_idx" ON "permit_comments" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "permit_assignments_user_id_idx" ON "permit_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permit_assignments_permit_id_idx" ON "permit_assignments" USING btree ("permit_id");--> statement-breakpoint
CREATE INDEX "portal_notifications_user_id_idx" ON "portal_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portal_notifications_user_read_idx" ON "portal_notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "portal_notifications_user_created_idx" ON "portal_notifications" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "permits" DROP COLUMN "permit_type";