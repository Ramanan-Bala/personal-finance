# Cashly - Personal Finance Backend

A production-ready backend for a personal finance application built with **ExpressJS**, **TypeScript**, **PostgreSQL**, and **Drizzle ORM**.

## Features

- ✅ **Authentication** - JWT-based with refresh token rotation
- ✅ **User Management** - Registration, login, profile management
- ✅ **Accounts Module** - Manage financial accounts with groups
- ✅ **Categories Module** - Income and expense categories
- ✅ **Transactions Module** - Create, read, update transactions with type safety
- ✅ **Lend/Debt Tracking** - Track borrowed/lent money with payments
- ✅ **Clean Architecture** - Modular structure with Services and Controllers
- ✅ **Type Safety** - Full TypeScript with Zod validation
- ✅ **Decimal Precision** - NUMERIC fields for money values
- ✅ **User Scoping** - All data scoped by userId

## Tech Stack

- **Framework**: ExpressJS
- **Language**: TypeScript 5
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT, Passport
- **Validation**: Zod
- **Security**: bcrypt, helmet, cors

## Project Structure

```
src/
├── db/                   # Drizzle schema and connection
├── middleware/           # Auth and validation middleware
├── modules/              # Feature modules
│   ├── auth/             # Authentication
│   ├── users/            # User profile
│   ├── accounts/         # Accounts and Groups
│   ├── categories/       # Categories
│   ├── transactions/     # Transactions
│   └── lend-debt/        # Lend/Debt
├── index.ts              # Application entry point
└── routes.ts             # Main router
```

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 12
- npm or yarn

## Installation

```bash
npm install
```

## Database Setup

1. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

2. Update `.env` with your PostgreSQL connection string

3. Generate and run Drizzle migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens

### Users

- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile

### Accounts

- `POST /api/accounts` - Create account
- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:accountId` - Get specific account
- `PATCH /api/accounts/:accountId` - Update account
- `DELETE /api/accounts/:accountId` - Delete account

- `POST /api/accounts/groups` - Create account group
- `GET /api/accounts/groups` - List groups
- `PATCH /api/accounts/groups/:groupId` - Update group
- `DELETE /api/accounts/groups/:groupId` - Delete group

### Categories

- `POST /api/categories` - Create category
- `GET /api/categories` - List categories
- `GET /api/categories?type=INCOME` - Filter by type
- `PATCH /api/categories/:categoryId` - Update category
- `DELETE /api/categories/:categoryId` - Delete category

### Transactions

- `POST /api/transactions` - Create transaction
- `GET /api/transactions?accountId=...` - Get by account
- `GET /api/transactions?from=...&to=...` - Get by date range
- `PATCH /api/transactions/:transactionId` - Update transaction
- `DELETE /api/transactions/:transactionId` - Delete transaction

### Lend/Debt

- `POST /api/lend-debt` - Create lend/debt
- `GET /api/lend-debt` - List all
- `PATCH /api/lend-debt/:id` - Update
- `DELETE /api/lend-debt/:id` - Delete

- `POST /api/lend-debt/payments` - Add payment
- `GET /api/lend-debt/payments/:paymentId` - Get payment
- `PATCH /api/lend-debt/payments/:paymentId` - Update payment
- `DELETE /api/lend-debt/payments/:paymentId` - Delete payment

## Development Scripts

### Database Management

```bash
# Generate migrations based on schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio to view data
npm run db:studio
```

### Linting

```bash
npm run lint
```
