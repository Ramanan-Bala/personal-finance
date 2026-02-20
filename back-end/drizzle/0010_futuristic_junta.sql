ALTER TABLE "lend_debt_payments" ADD COLUMN "accountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lend_debt" ADD COLUMN "accountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lend_debt_payments" ADD CONSTRAINT "lend_debt_payments_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lend_debt" ADD CONSTRAINT "lend_debt_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;