-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "openingBalance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "lend_debt" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "lend_debt_payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
