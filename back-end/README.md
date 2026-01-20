# Cashly - Personal Finance Backend

A production-ready backend for a personal finance application built with NestJS, TypeScript, PostgreSQL, and Prisma.

## Features

- ✅ **Authentication** - JWT-based with refresh token rotation
- ✅ **User Management** - Registration, login, profile management
- ✅ **Accounts Module** - Manage financial accounts with groups
- ✅ **Categories Module** - Income and expense categories
- ✅ **Transactions Module** - Create, read, update transactions with type safety
- ✅ **Ledger Module** - Daily summaries and account balances
- ✅ **Lend/Debt Tracking** - Track borrowed/lent money with payments
- ✅ **Clean Architecture** - Repository pattern, service layer isolation
- ✅ **Type Safety** - Full TypeScript with strict mode
- ✅ **Decimal Precision** - NUMERIC fields for money values
- ✅ **User Scoping** - All data scoped by userId

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Security**: bcrypt for password hashing

## Project Structure

```
src/
├── auth/                 # Authentication (registration, login, JWT)
├── users/                # User profile management
├── accounts/             # Account and account group management
├── categories/           # Income/expense categories
├── transactions/         # Transaction handling (INCOME, EXPENSE, TRANSFER)
├── ledger/               # Daily summaries and balance queries
├── lend-debt/            # Lend/debt tracking with partial payments
├── common/               # Shared utilities
│   ├── guards/          # JWT auth guard
│   ├── decorators/      # CurrentUser decorator
│   ├── filters/         # Global exception filter
│   └── exceptions/      # Custom exceptions
├── prisma/              # Database schema and migrations
└── main.ts              # Application entry point
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

3. Run Prisma migrations:

```bash
npm run prisma:migrate
```

4. (Optional) Seed sample data:

```bash
npm run prisma:seed
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

- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke tokens

### Users

- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile

### Accounts

- `POST /accounts` - Create account
- `GET /accounts` - List all accounts
- `GET /accounts/:accountId` - Get specific account
- `PATCH /accounts/:accountId` - Update account
- `DELETE /accounts/:accountId` - Delete account

- `POST /accounts/groups` - Create account group
- `GET /accounts/groups` - List groups
- `PATCH /accounts/groups/:groupId` - Update group
- `DELETE /accounts/groups/:groupId` - Delete group

### Categories

- `POST /categories` - Create category
- `GET /categories` - List categories
- `GET /categories?type=INCOME` - Filter by type
- `PATCH /categories/:categoryId` - Update category
- `DELETE /categories/:categoryId` - Delete category

### Transactions

- `POST /transactions` - Create transaction
- `GET /transactions?accountId=...` - Get by account
- `GET /transactions?from=...&to=...` - Get by date range
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Ledger

- `GET /ledger/daily-summary?from=...&to=...` - Daily summaries
- `GET /ledger/account/:accountId/balance` - Account balance
- `GET /ledger/accounts/balances` - All account balances

### Lend/Debt

- `POST /lend-debt` - Create lend/debt
- `GET /lend-debt` - List all
- `PATCH /lend-debt/:id` - Update
- `DELETE /lend-debt/:id` - Delete

- `POST /lend-debt/payments` - Add payment
- `PATCH /lend-debt/payments/:paymentId` - Update payment
- `DELETE /lend-debt/payments/:paymentId` - Delete payment

## Database Schema Highlights

### Money Handling

- All monetary values use `NUMERIC(19, 2)` for precision
- No floating-point arithmetic
- Decimal type from Prisma client runtime

### User Scoping

- Every table has a `userId` field
- All queries filtered by userId for data isolation
- Proper indexes on userId for performance

### Transactions

- Atomic database transactions for consistency
- Support for INCOME, EXPENSE, and TRANSFER types
- All writes wrapped in DB transactions

### Categories

- Scoped by userId and type (INCOME/EXPENSE)
- Cannot delete categories used in transactions

### Lend/Debt

- Track LEND and DEBT separately
- Support partial payments
- Auto-settlement when fully paid

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT access tokens (15min default)
- ✅ Refresh token rotation
- ✅ Token revocation support
- ✅ CORS configured
- ✅ All inputs validated with class-validator
- ✅ User-scoped data access

## Error Handling

- Centralized exception filter
- Consistent error response format
- Meaningful HTTP status codes
- Request logging

## Development

### Lint

```bash
npm run lint
```

### Database Studio (Visual Inspection)

```bash
npm run prisma:studio
```

### Type Checking

```bash
npx tsc --noEmit
```

## Environment Variables

| Variable           | Description            | Default                          |
| ------------------ | ---------------------- | -------------------------------- |
| NODE_ENV           | Environment            | development                      |
| PORT               | Server port            | 3000                             |
| DATABASE_URL       | PostgreSQL connection  | postgres://localhost:5432/cashly |
| JWT_SECRET         | JWT signing key        | -                                |
| JWT_EXPIRY         | Access token lifetime  | 15m                              |
| JWT_REFRESH_SECRET | Refresh token key      | -                                |
| JWT_REFRESH_EXPIRY | Refresh token lifetime | 7d                               |

## Next Steps

1. **Setup PostgreSQL** locally or use cloud provider (AWS RDS, Supabase, etc.)
2. **Update `.env`** with database credentials
3. **Run migrations** with `npm run prisma:migrate`
4. **Start development** with `npm run dev`
5. **Test endpoints** with Postman or similar tool
6. **Connect frontend** application to the API

## Production Deployment

1. Generate optimized build: `npm run build:prod`
2. Set secure environment variables
3. Run migrations: `npm run prisma:migrate:prod`
4. Start with: `npm start`

## Future Enhancements

- [ ] Budget management with alerts
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Advanced reporting and analytics
- [ ] Export to CSV/PDF
- [ ] Mobile app integration
- [ ] Two-factor authentication
- [ ] Integration with banking APIs
- [ ] Split into microservices
- [ ] Real-time notifications

## License

ISC
