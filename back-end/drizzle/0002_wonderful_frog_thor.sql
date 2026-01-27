ALTER TABLE "accounts" ALTER COLUMN "openingBalance" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "lend_debt_payments" ALTER COLUMN "amount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "lend_debt" ALTER COLUMN "amount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE numeric(12, 2);