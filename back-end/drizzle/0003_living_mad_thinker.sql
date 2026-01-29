ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is2faEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otpExpiry" timestamp;