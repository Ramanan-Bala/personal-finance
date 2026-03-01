# Coding Standards & Rules

## TypeScript

### General

- Always use strict TypeScript — no `any` unless absolutely unavoidable, prefer `unknown`
- Never use `// @ts-ignore` — fix the type error properly
- Always define return types on functions explicitly
- Use `type` for object shapes, unions, and intersections; use `interface` only for extendable contracts
- Prefer `const` over `let`; never use `var`
- Use optional chaining `?.` and nullish coalescing `??` instead of manual null checks

```typescript
// ❌ Bad
const name = user && user.profile && user.profile.name;
const display = name ? name : "Unknown";

// ✅ Good
const name = user?.profile?.name ?? "Unknown";
```

### Types & Interfaces

- Co-locate types with the code that uses them
- Export types that are shared across modules
- Use Drizzle's `$inferSelect` and `$inferInsert` for DB types — never manually duplicate schema types

```typescript
// ✅ Always infer from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Enums

- Prefer `as const` objects over TypeScript enums for runtime flexibility

```typescript
// ❌ Avoid
enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

// ✅ Prefer
const TransactionType = { INCOME: "INCOME", EXPENSE: "EXPENSE" } as const;
type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
```

### Error Handling

- Always type catch blocks — use `error instanceof Error` before accessing `.message`
- Never swallow errors silently — always log at minimum

```typescript
// ✅ Correct
try {
  await doSomething();
} catch (error) {
  console.error("Context:", error instanceof Error ? error.message : error);
  throw error; // re-throw unless intentionally handling
}
```

### Async

- Always use `async/await` — never mix with `.then()/.catch()` chains
- Always `await` promises — never fire-and-forget unless intentional and commented
- Mark intentional fire-and-forget with a comment: `// intentional: non-blocking`

---

## Next.js (App Router)

### Component Rules

- Default to Server Components — only add `'use client'` when needed
- Valid reasons for `'use client'`: `useState`, `useEffect`, event handlers, browser APIs, Framer Motion
- Never put `useEffect` or hooks directly in `app/layout.tsx` — extract to a client component
- Keep client components small and at the leaf of the tree

```tsx
// ❌ Bad — makes entire layout a client component
'use client';
export default function RootLayout({ children }) {
  useEffect(() => { ... }, []);
  ...
}

// ✅ Good — isolated client component
// components/Analytics.tsx
'use client';
export function Analytics() {
  useEffect(() => { ... }, []);
  return null;
}

// app/layout.tsx — stays as Server Component
import { Analytics } from '@/components/Analytics';
export default function RootLayout({ children }) {
  return <html><body><Analytics />{children}</body></html>;
}
```

### File & Folder Naming

- Pages: `app/(group)/page-name/page.tsx`
- Components: PascalCase — `TransactionCard.tsx`
- Hooks: camelCase with `use` prefix — `useTransactions.ts`
- Utilities: camelCase — `formatCurrency.ts`
- Route groups with `()` for layout grouping without affecting URL

### Data Fetching

- Fetch data in Server Components when possible — avoid unnecessary client-side fetching
- Use Axios instance from `lib/axios.ts` for all client-side API calls — never raw `fetch` on client
- Always handle loading and error states explicitly

```tsx
// ✅ Client-side fetch pattern
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  api
    .get("/transactions")
    .then((res) => setData(res.data))
    .catch((err) => setError(err))
    .finally(() => setLoading(false));
}, []);
```

### Routing

- Use `useRouter` from `next/navigation` — not `next/router`
- Use `<Link>` for navigation — never `<a>` tags for internal routes
- Protect routes via middleware or layout-level auth check

### PWA & Mobile Rules

- Use `100dvh` instead of `100vh` everywhere
- Floating buttons must use `position: fixed` never `position: absolute`
- Never use Tailwind arbitrary values for complex CSS expressions (`calc` + `env`) — use `style` prop instead

```tsx
// ❌ Bad
className="bottom-[max(env(safe-area-inset-bottom)+2rem,5rem)]"

// ✅ Good
style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 2rem), 5rem)' }}
```

- Always wrap `@media (display-mode: standalone)` for PWA-only styles
- `shouldScaleBackground={false}` on all Vaul `Drawer.Root` components

### Component Patterns

- One component per file
- Props interface defined above the component
- Destructure props at function signature

```tsx
// ✅ Correct
interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  ...
}
```

### Styling

- Tailwind utility classes only — no inline styles except for dynamic/complex CSS values
- No custom CSS files unless absolutely necessary
- Use `cn()` helper for conditional classes (clsx + tailwind-merge)

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-class", isActive && "active-class", className)} />;
```

---

## Express (Backend)

### Project Structure

```
src/
├── modules/          # Feature modules (auth, transactions, etc.)
│   └── transactions/
│       ├── transactions.controller.ts
│       ├── transactions.service.ts
│       ├── transactions.routes.ts
│       └── transactions.types.ts
├── middleware/       # Express middleware
├── db/
│   └── schema.ts     # Single source of truth for DB types
├── lib/              # Shared clients (nvidia, etc.)
├── jobs/             # Cron jobs (recurring processor)
└── index.ts          # App entry point
```

### Controller Rules

- Controllers handle HTTP only — request parsing, response sending, status codes
- No business logic in controllers — delegate everything to service
- Always use `try/catch` and pass errors to `next(error)`

```typescript
// ✅ Correct controller
export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id; // always from JWT, never req.body
    const result = await transactionService.create(userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

### Service Rules

- Services contain all business logic
- Services interact with DB via Drizzle
- Services are plain classes or exported functions — no Express types (`req`, `res`)
- Always validate that resources belong to the requesting user before modifying

```typescript
// ✅ Always verify ownership
async function deleteTransaction(userId: string, transactionId: string) {
  const existing = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, transactionId),
      eq(transactions.userId, userId), // ← critical ownership check
    ),
  });
  if (!existing) throw new NotFoundError("Transaction not found");
  await db.delete(transactions).where(eq(transactions.id, transactionId));
}
```

### Auth Rules

- Always extract `userId` from `req.user.id` (Passport JWT) — never from `req.body` or `req.params`
- All routes except `/auth/login` and `/auth/register` must use JWT middleware
- Refresh tokens must be validated against DB (check `revokedAt` is null, `expiresAt` in future)
- Passwords always hashed with bcrypt — never store plaintext

```typescript
// ✅ Protected route pattern
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getAll,
);
```

### Drizzle ORM Rules

- Never write raw SQL — use Drizzle query builder
- Always use `db.query.*` for reads with relations, `db.*` for writes
- Always `.returning()` after insert/update when you need the result
- Use `and()`, `eq()`, `or()` from `drizzle-orm` for conditions

```typescript
// ✅ Correct patterns
// Read with relations
const result = await db.query.transactions.findMany({
  where: and(eq(transactions.userId, userId)),
  with: { category: true, account: true },
});

// Insert and return
const [created] = await db.insert(transactions).values(data).returning();

// Update
await db
  .update(transactions)
  .set({ notes: "updated" })
  .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
```

### Decimal / Money Rules

- Always store amounts as `decimal(12, 2)` — never `float` or `integer`
- Drizzle returns decimals as strings — always `parseFloat()` before arithmetic
- Never do arithmetic in JS on raw DB decimal strings

```typescript
// ✅ Correct
const total =
  parseFloat(transaction.amount) + parseFloat(otherTransaction.amount);
```

### Error Handling

- Use a centralized error handler middleware registered last in `index.ts`
- Create custom error classes with HTTP status codes
- Never expose stack traces in production responses

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// middleware/errorHandler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
```

### API Response Format

Always return consistent response shapes:

```typescript
// Success
res.status(200).json({ data: result });
res.status(201).json({ data: created });

// Error (via errorHandler)
res.status(400).json({ message: "Validation error" });
res.status(404).json({ message: "Not found" });
```

### Validation

- Validate all request bodies before passing to service
- Use `zod` for schema validation

```typescript
import { z } from "zod";

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  accountId: z.string().uuid(),
  notes: z.string().optional(),
});

// In controller
const parsed = createTransactionSchema.safeParse(req.body);
if (!parsed.success)
  return res.status(400).json({ message: parsed.error.message });
```

### Cron Jobs

- All cron jobs in `src/jobs/`
- Start all jobs in `index.ts` after DB connection confirmed
- Log start, success, and failure of each job run
- Never let a failed individual record stop the entire job — use try/catch per record

```typescript
for (const item of dueItems) {
  try {
    await processItem(item); // isolated per item
  } catch (error) {
    console.error(`Failed to process ${item.id}:`, error);
    // continue to next item
  }
}
```

---

## General Rules (All Code)

- **No magic numbers** — extract to named constants
- **No commented-out code** — delete it, git has history
- **No `console.log` in production** — use proper logging or remove
- **Keep functions small** — if a function does more than one thing, split it
- **DRY** — if you write the same logic twice, extract it
- **Explicit over implicit** — clear variable names, no abbreviations except well-known ones (`id`, `url`, `db`)
