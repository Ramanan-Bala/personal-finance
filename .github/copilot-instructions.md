# Cashly - Copilot Instructions

This is a full-stack personal finance application with a **Node.js/Express backend** and **Next.js frontend**, both in TypeScript.

## Architecture Overview

**Backend** (`back-end/`): Modular Express API using clean architecture patterns

- Services layer for business logic
- Controllers for request/response handling
- Database schema with Drizzle ORM (PostgreSQL)
- JWT authentication with refresh token rotation

**Frontend** (`cashly-next/`): Next.js 16 app directory structure

- Module-based components in `shared/`
- Zustand for state management
- Zod for form validation
- Axios with token refresh interceptor for API communication

## Key Developer Workflows

### Backend Commands

```bash
# Development
npm run dev              # Watch mode with tsx
npm run build           # TypeScript compilation to dist/
npm start              # Run built dist/index.js

# Database
npm run db:generate    # Create Drizzle migration files from schema changes
npm run db:migrate     # Execute pending migrations
npm run db:studio      # Launch Drizzle Studio UI

# Linting
npm run lint           # ESLint with auto-fix
```

### Frontend Commands

```bash
npm run dev            # Next.js dev server (http://localhost:3000)
npm run build          # Production build
npm run start          # Production server
npm run lint           # ESLint
```

## Project-Specific Patterns

### Backend: Module Structure

Every feature module follows this structure (see `src/modules/{feature}/`):

- **`{feature}.schema.ts`** - Zod schemas for validation + TypeScript types
- **`{feature}.service.ts`** - Core business logic; queries DB via Drizzle
- **`{feature}.controller.ts`** - Request handling; calls service & validates input
- **`{feature}.routes.ts`** - Route definitions; uses validate middleware

Example: `src/modules/accounts/accounts.service.ts` handles account CRUD; `accounts.controller.ts` calls it.

### Database Design Decisions

- **User-scoped data**: All entities reference `userId` directly; enables row-level security
- **Decimal precision**: Money fields use `decimal(12, 2)` not floats (see `schema.ts`)
- **UUID primary keys**: Generated via `crypto.randomUUID()` in schema defaults
- **Enums**: PostgreSQL enums (e.g., `categoryTypeEnum` with 'INCOME'/'EXPENSE')
- **Relations**: Drizzle relations define `one()` and `many()` connections for eager loading

### Backend: Authentication & Authorization

- JWT strategy in `middleware/auth.ts` via passport-jwt
- `authMiddleware` extracts userId from JWT payload (`jwt_payload.sub`)
- Protected routes use `.post('/path', authMiddleware, handler)`
- Token refresh handled via separate `/api/auth/refresh` endpoint (stored in `refreshTokens` table)

### Backend: Validation Pattern

Middleware in `src/middleware/validate.ts`:

```typescript
router.post("/endpoint", validate(mySchema), controller.method);
```

Zod schemas in `{feature}.schema.ts` define input shape + return typed inputs to service.

### Frontend: API Communication

- Axios instance in `lib/api/axios.ts` auto-adds `Authorization: Bearer {token}` header
- Token refresh interceptor queues failed 401 requests during refresh, retries after
- Toast notifications for CRUD success (via Zustand `toastStore`) if `showSuccessToast: true`
- Base URL: `http://localhost:8080/api` (matches backend CORS allowlist)

### Frontend: Form Validation & State

- Zod schemas in `shared/validators/` mirror backend schemas
- React Hook Form + `@hookform/resolvers` for form binding
- Zustand stores in `lib/store/` for app state (toast notifications, auth state, etc.)

## Integration Points & Data Flows

1. **Authentication flow**:
   - Register → Create user + default group + accounts + categories (auth.service.ts)
   - Login → Generate access + refresh tokens
   - Token refresh → Middleware intercepts 401, POST `/auth/refresh`, retry

2. **Account management**:
   - Frontend form → POST `/api/accounts` (controller validates via Zod)
   - Service inserts into `accounts` table with `userId` + `groupId`
   - Response omits `createdAt`/`updatedAt` for API cleanliness

3. **Transactions**:
   - Store transactions with `accountId`, `categoryId`, `amount` (decimal)
   - Support INCOME, EXPENSE, TRANSFER types (enum in schema)
   - All scoped by userId via joined queries

## Critical Files to Understand

- [back-end/src/db/schema.ts](back-end/src/db/schema.ts) - Database tables & relations
- [back-end/src/routes.ts](back-end/src/routes.ts) - Route aggregation
- [back-end/src/middleware/auth.ts](back-end/src/middleware/auth.ts) - JWT strategy setup
- [back-end/src/modules/auth/auth.service.ts](back-end/src/modules/auth/auth.service.ts) - Auth logic & token generation
- [cashly-next/src/lib/api/axios.ts](cashly-next/src/lib/api/axios.ts) - API client with token refresh
- [back-end/package.json](back-end/package.json) - Core dependencies (Express, Drizzle, Zod, Passport)

## Common Conventions

- **Error handling**: Throw errors in services; controllers catch & return 400/500 with message
- **Type exports**: Use `z.infer<typeof schema>` for input types (not separate interfaces)
- **Decimal handling**: Always pass money amounts as strings to Drizzle to avoid precision loss
- **Timestamps**: Auto-managed by `defaultNow()` in schema; excluded from API responses where possible
- **Correlation**: When adding new modules, follow the same 4-file pattern (schema, service, controller, routes)
