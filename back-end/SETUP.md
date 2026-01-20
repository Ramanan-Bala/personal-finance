# Cashly Backend - Setup Guide

## Quick Start (Docker)

The fastest way to get started is with Docker Compose:

```bash
# Start all services (PostgreSQL + NestJS app)
docker-compose up

# The app will be available at http://localhost:3000
```

The database will be automatically initialized with the Prisma schema.

## Manual Setup

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/download/) or use cloud provider)
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy the example env file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/cashly"
JWT_SECRET=your_32_char_secret_key_here_minimum
JWT_REFRESH_SECRET=your_32_char_refresh_secret_key_here
```

**Important**:

- Change JWT secrets to random strings (min 32 chars) in production
- Use strong database passwords

### Step 3: Set Up Database

Create the PostgreSQL database:

```bash
createdb cashly
```

Or via PostgreSQL client:

```sql
CREATE DATABASE cashly;
```

### Step 4: Run Migrations

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will create all tables in your database.

### Step 5: (Optional) Seed Sample Data

```bash
npm run prisma:seed
```

This creates:

- A test user (email: `test@example.com`, password: `password123`)
- Sample account groups and accounts
- Sample categories
- Sample transactions
- Sample lend/debt records

### Step 6: Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourmail@example.com",
    "name": "Your Name",
    "password": "SecurePassword123"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Create an Account

Use the `accessToken` from registration:

```bash
curl -X POST http://localhost:3000/accounts/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Accounts",
    "description": "Personal accounts"
  }'
```

### 3. Create a Financial Account

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "groupId": "GROUP_ID_FROM_PREVIOUS_STEP",
    "name": "Savings Account",
    "openingBalance": 1000.00
  }'
```

## Using Postman

1. Import the environment: [postman_environment.json](./postman_environment.json)
2. Create requests with the endpoints listed in README.md
3. Set `Authorization` header to `Bearer {{accessToken}}`

## Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

Opens http://localhost:5555 with a visual database explorer.

### Create Migrations After Schema Changes

After editing `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

Name the migration (e.g., "add_new_field")

### View Migration Status

```bash
npm run prisma:migrate status
```

## Building for Production

### 1. Build the Project

```bash
npm run build
```

Creates optimized code in `dist/` directory.

### 2. Run Production Build Locally

```bash
npm run build:prod
npm start
```

### 3. Environment Setup

Create `.env` with production values:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:secure_password@db_host:5432/cashly_prod"
JWT_SECRET=your_secure_random_secret_min_32_chars
JWT_REFRESH_SECRET=your_secure_random_refresh_secret_min_32_chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### 4. Deploy with Docker

```bash
# Build image
docker build -t cashly-backend .

# Run container
docker run \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  cashly-backend
```

Or use production compose file:

```bash
docker-compose -f docker-compose.prod.yml up
```

## Troubleshooting

### Database Connection Failed

```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

```bash
# Check if PostgreSQL is running (macOS)
brew services list | grep postgres

# Start PostgreSQL if needed
brew services start postgresql
```

### Port Already in Use

```
error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change port in `.env` or kill the process:

```bash
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Found

```
Cannot find module '.prisma/client'
```

**Solution**: Regenerate Prisma client:

```bash
npm run prisma:generate
```

### Database Migration Error

If migrations fail:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-apply migrations
npm run prisma:migrate
```

## Performance Tips

1. **Use indexes**: All userId fields are indexed for fast queries
2. **Pagination**: Implement pagination for large queries in controllers
3. **Caching**: Add Redis for frequently accessed data
4. **Connection pooling**: Use PgBouncer for production databases
5. **Query optimization**: Use `include` in Prisma sparingly

## Security Checklist for Production

- [ ] Use HTTPS/TLS
- [ ] Set strong JWT secrets (32+ random characters)
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable CORS only for trusted domains
- [ ] Set database passwords to strong values
- [ ] Enable password reset functionality
- [ ] Implement request logging and monitoring
- [ ] Use database backups
- [ ] Keep dependencies updated

## Next Steps

1. **Add frontend**: Connect a React/Vue/Angular app to this API
2. **Add tests**: Create unit and integration tests
3. **Add email**: Integrate SendGrid or similar for emails
4. **Add payments**: Integrate Stripe for premium features
5. **Add analytics**: Set up analytics tracking
6. **Add notifications**: Integrate Twilio for SMS alerts
7. **Monitor**: Set up Sentry for error tracking
8. **Scale**: Consider breaking into microservices

## Support

For issues or questions, check the [README.md](./README.md) for full API documentation.
