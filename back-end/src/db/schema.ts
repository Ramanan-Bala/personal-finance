import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Enums
export const categoryTypeEnum = pgEnum('CategoryType', ['INCOME', 'EXPENSE']);
export const transactionTypeEnum = pgEnum('TransactionType', [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
]);
export const lendDebtTypeEnum = pgEnum('LendDebtType', ['LEND', 'DEBT']);
export const lendDebtStatusEnum = pgEnum('LendDebtStatus', ['OPEN', 'SETTLED']);
export const recurrenceFrequencyEnum = pgEnum('RecurrenceFrequency', [
  'DAILY',
  'WEEKLY',
  'MONTHLY_START',
  'MONTHLY_END',
  'YEARLY',
]);
export const recurringStatusEnum = pgEnum('RecurringStatus', [
  'ACTIVE',
  'PAUSED',
  'STOPPED',
]);
// back-end/src/db/schema.ts
export type User = typeof users.$inferSelect;
// Users
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  name: text('name'),
  phone: text('phone'),
  passwordHash: text('passwordHash').notNull(),
  is2faEnabled: boolean('is2faEnabled').default(false).notNull(),
  otp: text('otp'),
  otpExpiry: timestamp('otpExpiry'),
  currency: text('currency').default('INR').notNull(),
  dateFormat: text('dateFormat').default('MM-DD-YYYY').notNull(),
  fontFamily: text('fontFamily').default('Inter').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  accountGroups: many(accountGroups),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  recurringTransactions: many(recurringTransactions),
  lendDebts: many(lendDebts),
  lendDebtPayments: many(lendDebtPayments),
}));

// Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  revokedAt: timestamp('revokedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// Account Groups
export const accountGroups = pgTable('account_groups', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const accountGroupsRelations = relations(
  accountGroups,
  ({ one, many }) => ({
    user: one(users, {
      fields: [accountGroups.userId],
      references: [users.id],
    }),
    accounts: many(accounts),
  }),
);

// Accounts
export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  groupId: text('groupId')
    .notNull()
    .references(() => accountGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  openingBalance: decimal('openingBalance', {
    precision: 12,
    scale: 2,
  }).notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  group: one(accountGroups, {
    fields: [accounts.groupId],
    references: [accountGroups.id],
  }),
  transactions: many(transactions),
  lendDebts: many(lendDebts),
  lendDebtPayments: many(lendDebtPayments),
}));

// Categories
export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  description: text('description'),
  isAiGenerated: boolean('isAiGenerated').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

// Recurring Transactions
export const recurringTransactions = pgTable('recurring_transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('accountId')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: text('categoryId').references(() => categories.id, {
    onDelete: 'set null',
  }),
  transferToAccountId: text('transferToAccountId').references(
    () => accounts.id,
    { onDelete: 'set null' },
  ),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  frequency: recurrenceFrequencyEnum('frequency').notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  nextOccurrence: timestamp('nextOccurrence').notNull(),
  status: recurringStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const recurringTransactionsRelations = relations(
  recurringTransactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [recurringTransactions.userId],
      references: [users.id],
    }),
    account: one(accounts, {
      fields: [recurringTransactions.accountId],
      references: [accounts.id],
    }),
    category: one(categories, {
      fields: [recurringTransactions.categoryId],
      references: [categories.id],
    }),
    transferAccount: one(accounts, {
      fields: [recurringTransactions.transferToAccountId],
      references: [accounts.id],
    }),
    transactions: many(transactions),
  }),
);

// Transactions
export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('accountId')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: text('categoryId').references(() => categories.id, {
    onDelete: 'cascade',
  }),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp('transactionDate').notNull(),
  notes: text('notes'),
  transferToAccountId: text('transferToAccountId').references(
    () => accounts.id,
    { onDelete: 'set null' },
  ),
  recurringTransactionId: text('recurringTransactionId').references(
    () => recurringTransactions.id,
    { onDelete: 'set null' },
  ),
  occurrenceDate: timestamp('occurrenceDate'),
  isOverridden: boolean('isOverridden').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('uq_recurring_occurrence').on(
    t.recurringTransactionId,
    t.occurrenceDate,
  ),
]);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  transferAccount: one(accounts, {
    fields: [transactions.transferToAccountId],
    references: [accounts.id],
  }),
  recurringTransaction: one(recurringTransactions, {
    fields: [transactions.recurringTransactionId],
    references: [recurringTransactions.id],
  }),
}));

// Lend/Debt
export const lendDebts = pgTable('lend_debt', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('accountId')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  type: lendDebtTypeEnum('type').notNull(),
  personName: text('personName').notNull(),
  phoneNumber: text('phoneNumber'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp('dueDate'),
  status: lendDebtStatusEnum('status').default('OPEN').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const lendDebtsRelations = relations(lendDebts, ({ one, many }) => ({
  user: one(users, {
    fields: [lendDebts.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [lendDebts.accountId],
    references: [accounts.id],
  }),
  payments: many(lendDebtPayments),
}));

// Lend/Debt Payments
export const lendDebtPayments = pgTable('lend_debt_payments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lendDebtId: text('lendDebtId')
    .notNull()
    .references(() => lendDebts.id, { onDelete: 'cascade' }),
  accountId: text('accountId')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp('paymentDate').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const lendDebtPaymentsRelations = relations(
  lendDebtPayments,
  ({ one }) => ({
    user: one(users, {
      fields: [lendDebtPayments.userId],
      references: [users.id],
    }),
    lendDebt: one(lendDebts, {
      fields: [lendDebtPayments.lendDebtId],
      references: [lendDebts.id],
    }),
    account: one(accounts, {
      fields: [lendDebtPayments.accountId],
      references: [accounts.id],
    }),
  }),
);
