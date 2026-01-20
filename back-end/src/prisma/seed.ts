import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create default account group
  const accountGroup = await prisma.accountGroup.create({
    data: {
      userId: user.id,
      name: 'Personal',
      description: 'Personal account group',
    },
  });

  console.log('✅ Created account group:', accountGroup.name);

  // Create default accounts
  const bankAccount = await prisma.account.create({
    data: {
      userId: user.id,
      groupId: accountGroup.id,
      name: 'SBI Bank Account',
      openingBalance: 5000,
      description: 'Primary bank account',
    },
  });

  const cashAccount = await prisma.account.create({
    data: {
      userId: user.id,
      groupId: accountGroup.id,
      name: 'Cash in Hand',
      openingBalance: 2000,
      description: 'Cash',
    },
  });

  console.log('✅ Created accounts:', bankAccount.name, cashAccount.name);

  // Create default income categories
  const salaryCategory = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Salary',
      type: 'INCOME',
      icon: '💼',
      description: 'Monthly salary',
    },
  });

  const freelanceCategory = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Freelance',
      type: 'INCOME',
      icon: '💻',
      description: 'Freelance projects',
    },
  });

  // Create default expense categories
  const groceryCategory = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Groceries',
      type: 'EXPENSE',
      icon: '🛒',
      description: 'Food and groceries',
    },
  });

  const transportCategory = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Transport',
      type: 'EXPENSE',
      icon: '🚗',
      description: 'Transportation',
    },
  });

  const utilitiesCategory = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Utilities',
      type: 'EXPENSE',
      icon: '💡',
      description: 'Electricity, water, gas',
    },
  });

  console.log(
    '✅ Created income categories:',
    salaryCategory.name,
    freelanceCategory.name,
  );
  console.log(
    '✅ Created expense categories:',
    groceryCategory.name,
    transportCategory.name,
    utilitiesCategory.name,
  );

  // Create sample transactions
  const today = new Date();
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: salaryCategory.id,
      type: 'INCOME',
      amount: 5000,
      transactionDate: lastMonth,
      notes: 'Monthly salary',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: groceryCategory.id,
      type: 'EXPENSE',
      amount: 150,
      transactionDate: new Date(lastMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Weekly groceries',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: transportCategory.id,
      type: 'EXPENSE',
      amount: 50,
      transactionDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      notes: 'Gas',
    },
  });

  console.log('✅ Created sample transactions');

  // Create sample lend/debt
  await prisma.lendDebt.create({
    data: {
      userId: user.id,
      type: 'LEND',
      personName: 'John Doe',
      amount: 200,
      dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Borrowed for coffee machine',
    },
  });

  console.log('✅ Created sample lend/debt');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
