ALTER TABLE "transactions" DROP CONSTRAINT "transactions_transferToAccountId_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transferToAccountId_accounts_id_fk" FOREIGN KEY ("transferToAccountId") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;