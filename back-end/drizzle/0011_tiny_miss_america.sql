ALTER TABLE "categories" ADD COLUMN "isAiGenerated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "isOverridden" boolean DEFAULT false NOT NULL;