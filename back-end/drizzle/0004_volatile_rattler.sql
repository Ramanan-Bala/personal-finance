ALTER TABLE "users" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dateFormat" text DEFAULT 'MM-DD-YYYY' NOT NULL;