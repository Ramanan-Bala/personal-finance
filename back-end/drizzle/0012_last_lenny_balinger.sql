CREATE TYPE "public"."RecurrenceFrequency" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY_START', 'MONTHLY_END', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."RecurringStatus" AS ENUM('ACTIVE', 'PAUSED', 'STOPPED');--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"categoryId" text,
	"transferToAccountId" text,
	"type" "TransactionType" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"notes" text,
	"frequency" "RecurrenceFrequency" NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"nextOccurrence" timestamp NOT NULL,
	"status" "RecurringStatus" DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "recurringTransactionId" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "occurrenceDate" timestamp;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_transferToAccountId_accounts_id_fk" FOREIGN KEY ("transferToAccountId") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurringTransactionId_recurring_transactions_id_fk" FOREIGN KEY ("recurringTransactionId") REFERENCES "public"."recurring_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_recurring_occurrence" ON "transactions" USING btree ("recurringTransactionId","occurrenceDate");