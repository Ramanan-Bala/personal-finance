import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  accountGroups: many(accountGroups),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

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
}));

// Lend/Debt
export const lendDebts = pgTable('lend_debt', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: lendDebtTypeEnum('type').notNull(),
  personName: text('personName').notNull(),
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
  }),
);
