# Cashly Backend - Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
# Docker (easiest)
docker-compose up

# Then visit: http://localhost:3000
```

## 📦 Installation

```bash
# Node.js manual setup
npm install
createdb cashly
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 🔑 Sample User

After seed script runs:

- **Email:** test@example.com
- **Password:** password123

## 📡 API Base URL

```
http://localhost:3000
```

## 🔐 Authentication

All protected endpoints need:

```
Authorization: Bearer <your_access_token>
```

## 🆕 Test User Creation

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Your Name",
    "password": "SecurePass123"
  }'

# Response includes accessToken and refreshToken
```

## 💼 Core Endpoints

| Module           | Endpoint              | Method   |
| ---------------- | --------------------- | -------- |
| **Auth**         | /auth/register        | POST     |
|                  | /auth/login           | POST     |
|                  | /auth/refresh         | POST     |
| **Accounts**     | /accounts             | GET/POST |
|                  | /accounts/groups      | GET/POST |
| **Categories**   | /categories           | GET/POST |
| **Transactions** | /transactions         | GET/POST |
| **Ledger**       | /ledger/daily-summary | GET      |
| **Lend/Debt**    | /lend-debt            | GET/POST |

## 📊 Database Schema

```sql
-- 8 Tables
users
refresh_tokens
account_groups
accounts
categories
transactions
lend_debt
lend_debt_payments

-- All scoped by userId
-- NUMERIC(19,2) for money
-- ISO 8601 timestamps
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Compile to dist/
npm run build:prod       # Optimized production build

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed sample data
npm run prisma:studio    # Visual database editor

# Code Quality
npm run lint             # Run ESLint
npm run test             # Run tests
npm run test:watch       # Test in watch mode
npm run test:cov         # Test coverage report

# Docker
docker-compose up        # Start dev environment
docker-compose down      # Stop dev environment
```

## 🌳 Project Structure

```
src/
├── auth/           # JWT authentication
├── users/          # User management
├── accounts/       # Accounts & groups
├── categories/     # Categories
├── transactions/   # Transactions (INCOME/EXPENSE/TRANSFER)
├── ledger/         # Ledger & balances
├── lend-debt/      # Lend/debt tracking
├── common/         # Shared (guards, decorators, filters)
└── main.ts         # App entry point
```

## 🔒 Security

| Feature          | Implementation               |
| ---------------- | ---------------------------- |
| Passwords        | bcrypt (10 rounds)           |
| Access Token     | JWT (15m)                    |
| Refresh Token    | JWT (7d)                     |
| Token Rotation   | ✅ Implemented               |
| User Isolation   | ✅ All data scoped by userId |
| Input Validation | ✅ class-validator           |
| CORS             | ✅ Enabled                   |

## 📝 Create Account Flow

```
1. Register/Login → Get access token
2. Create Account Group → Get groupId
3. Create Account → Provide groupId
4. Create Category → Select type (INCOME/EXPENSE)
5. Create Transaction → Link to account & category
6. View Balance → GET /ledger/account/:accountId/balance
```

## 💰 Money Handling

```
// Always use Decimal for precision
amount: new Decimal("1000.50")

// NUMERIC(19,2) in database
// No floating-point errors
// Safe for financial calculations
```

## 🐛 Debugging

```bash
# View logs
docker-compose logs -f app

# Database browser
npm run prisma:studio

# Check types
npx tsc --noEmit

# Run linter
npm run lint
```

## 🚢 Deployment

```bash
# Quick deployment options:

# 1. Heroku
heroku create cashly
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# 2. Docker to any server
docker-compose -f docker-compose.prod.yml up

# 3. Node.js on server
npm install
npm run build
npm start

# See DEPLOYMENT.md for full guides
```

## 📚 Documentation Files

| File                        | Purpose                        |
| --------------------------- | ------------------------------ |
| README.md                   | Project overview               |
| SETUP.md                    | Installation & troubleshooting |
| API.md                      | Complete endpoint docs         |
| DEPLOYMENT.md               | Deployment guides              |
| PROJECT_SUMMARY.md          | Architecture overview          |
| IMPLEMENTATION_CHECKLIST.md | What's done                    |

## ⚙️ Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/cashly
JWT_SECRET=your_random_secret_min_32_chars
JWT_REFRESH_SECRET=your_random_refresh_secret_min_32_chars
```

## 🆘 Troubleshooting

| Problem                | Solution                                           |
| ---------------------- | -------------------------------------------------- |
| Connection refused     | Ensure PostgreSQL running                          |
| Port 3000 in use       | Change PORT in .env                                |
| Missing @prisma/client | Run `npm run prisma:generate`                      |
| Migration fails        | Run `npm run prisma:migrate reset`                 |
| Docker errors          | Run `docker-compose down` then `docker-compose up` |

## 📞 Support

- **Docs**: Read README.md, SETUP.md, API.md
- **Issues**: Check SETUP.md troubleshooting section
- **Examples**: See Postman collection in repo
- **Community**: NestJS Discord, Stack Overflow

## 🎯 Next Steps

1. **Read SETUP.md** - Get it running
2. **Test endpoints** - Use curl or Postman
3. **Review API.md** - Understand all endpoints
4. **Deploy** - Follow DEPLOYMENT.md
5. **Connect frontend** - Your React/Vue app

## 📊 Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT + Passport
- **Validation**: class-validator
- **Security**: bcrypt

## 💡 Quick Tips

```bash
# Get all user's transactions
GET /transactions?from=2024-01-01&to=2024-01-31

# Get account balance
GET /ledger/account/:accountId/balance

# Create transaction with transfer
POST /transactions
{
  "type": "TRANSFER",
  "accountId": "from_account",
  "transferToAccountId": "to_account",
  "amount": 100,
  "transactionDate": "2024-01-15"
}

# Refresh access token
POST /auth/refresh
{ "refreshToken": "token" }
```

## 🔄 Transaction Example

```json
{
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "type": "EXPENSE",
  "amount": 50.0,
  "transactionDate": "2024-01-15T10:00:00Z",
  "notes": "Coffee"
}
```

## 📈 Scaling

```
1. Local Development → npm run dev
2. Docker Development → docker-compose up
3. Single Server → npm run build && npm start
4. Multiple Servers → Add load balancer + Redis
5. Microservices → Split by module (see design)
```

## 🎓 Learning Path

1. **Quick Start** (5 min) - Get running
2. **API Docs** (15 min) - Understand endpoints
3. **Database Schema** (10 min) - Review tables
4. **Source Code** (30 min) - Review structure
5. **Test Endpoints** (15 min) - Try API
6. **Deploy** (20 min) - Choose provider

---

**Created:** January 15, 2025
**Status:** ✅ Production-Ready
**Version:** 1.0.0
