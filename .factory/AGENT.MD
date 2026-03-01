# Personal Finance App — Agent Guide

## Agent Behavior Rules

These rules govern how the agent must behave on every task. They are non-negotiable and apply before any implementation begins.

### 1. Always Ask Before Acting

- Never start writing code or making changes without first understanding the full requirement
- If anything is ambiguous, unclear, or missing — **ask**
- Ask all clarifying questions upfront in a single message — do not ask one question at a time across multiple turns
- Questions to always ask if not already clear:
  - Which layer is affected? (frontend, backend, or both)
  - Which files or modules are involved?
  - Are there existing patterns or components to follow or reuse?
  - Are there edge cases or constraints to be aware of?
  - What is the expected input and output?

```
// ✅ Always do this first
"Before I implement this, I have a few questions:
1. Should this affect both frontend and backend?
2. Is there an existing similar component I should follow?
3. How should errors be handled — silently or with user feedback?"
```

### 2. Brainstorm → Plan → Review → Execute

Never jump straight to implementation. Always follow this 4-step process:

**Step 1 — Brainstorm**
Think through all possible approaches. Consider tradeoffs of each. Do not default to the first solution that comes to mind.

**Step 2 — Plan**
Write out a clear implementation plan before touching any code:

- List every file that will be created or modified
- Describe what each change does and why
- Identify any DB schema changes, migrations, or API changes needed
- Call out any risks or side effects

**Step 3 — Review**
Re-read the plan and check:

- Does it follow the coding standards in `rules.md`?
- Does it follow the patterns described in `agent.md`?
- Does it handle error cases?
- Does it introduce any breaking changes?
- Is there a simpler way to achieve the same result?

**Step 4 — Execute**
Only after the plan is reviewed and confirmed, write the code. Follow the plan exactly — do not deviate without flagging it.

```
// ✅ Correct flow
"Here is my plan before I implement:

Files to change:
- back-end/src/modules/transactions/transactions.service.ts — add X
- back-end/src/modules/transactions/transactions.routes.ts — add route Y
- front-end/src/components/TransactionForm.tsx — add field Z

Risks:
- This touches the transactions table — no schema change needed
- Edge case: what if accountId doesn't belong to the user? I'll add an ownership check.

Does this plan look good before I proceed?"
```

### 3. Never Assume — Always Confirm

- Do not assume what a file contains — ask to see it or reference what has already been shared
- Do not assume which component, hook, or utility already exists — ask
- Do not assume DB column names, types, or relations — refer to `schema.ts`
- Do not assume an API endpoint exists — refer to the API structure in this document
- Do not assume the user wants the "standard" approach — their codebase may have specific patterns
- If two approaches are equally valid, present both and ask which to use

```
// ❌ Never do this
"I'll add a new hook useTransactions.ts for this"
// (without checking if it already exists)

// ✅ Always do this
"Does a useTransactions hook already exist? If so, share it and I'll extend it.
If not, I'll create one — should it live in hooks/ or alongside the component?"
```

### 4. Scope Control

- Only change what is necessary for the task — do not refactor unrelated code
- If you notice an unrelated issue while implementing, flag it separately — do not fix it silently
- Never delete existing code unless explicitly asked to
- Never rename files, variables, or functions unless explicitly asked to

### 5. After Implementation

- Summarize exactly what was changed and why
- List any follow-up tasks or known limitations
- Flag anything that needs a DB migration
- Flag any new environment variables added

---

## Project Overview

A full-stack personal finance application with a Next.js frontend and Node.js/Express backend. Users can manage accounts, track transactions, set up recurring payments, manage lend/debt, and get AI-powered transaction categorization.

---

## Repository Structure

```
/
├── front-end/        # Next.js App Router
└── back-end/         # Node.js + Express + Drizzle ORM
```

---

## Frontend

### Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Drawer/Sheet:** Vaul
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Language:** TypeScript

### Project Structure

```
front-end/
├── app/                  # App Router pages
│   ├── layout.tsx        # Root layout (Server Component)
│   ├── (auth)/           # Auth pages (login, register)
│   └── (dashboard)/      # Protected pages
├── components/
│   ├── ui/               # Radix UI based components
│   └── shared/           # Reusable app components
├── hooks/                # Custom React hooks
├── lib/                  # Axios instance, utilities
└── public/
    └── sw.js             # Service worker (PWA)
```

### Key Conventions

**Server vs Client Components**

- `app/layout.tsx` is a Server Component — never add `useEffect` or state directly
- Create separate `'use client'` components and import them into layout

```tsx
// ✅ Correct pattern
// components/ClientWrapper.tsx
'use client';
export function ClientWrapper() {
  useEffect(() => { ... }, []);
  return null;
}

// app/layout.tsx (Server Component)
import { ClientWrapper } from '@/components/ClientWrapper';
export default function RootLayout({ children }) {
  return (
    <html><body>
      <ClientWrapper />
      {children}
    </body></html>
  );
}
```

**Axios Setup**

```typescript
// lib/axios.ts
import axios from "axios";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
export default api;
```

**PWA**

- Service worker registered via `ServiceWorkerRegister` client component
- Manifest at `public/manifest.json`
- Use `@media (display-mode: standalone)` for PWA-specific CSS
- Use `100dvh` instead of `100vh` to avoid mobile keyboard issues
- Floating action buttons must use `position: fixed` not `absolute`
- Safe area insets: use `env(safe-area-inset-bottom)` with inline styles for complex expressions:

```tsx
style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 1.5rem), 4rem)' }}
```

**Mobile Keyboard Fix**

```typescript
// hooks/useKeyboardFix.ts — add to root layout
export function useKeyboardFix() {
  useEffect(() => {
    const handleFocusOut = () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.body.style.transform = "";
        document.body.style.height = "";
      }, 150);
    };
    document.addEventListener("focusout", handleFocusOut);
    return () => document.removeEventListener("focusout", handleFocusOut);
  }, []);
}
```

**Vaul Drawer (Mobile Forms)**

```tsx
import { Drawer } from "vaul";
<Drawer.Root
  open={open}
  onOpenChange={onClose}
  shouldScaleBackground={false} // prevents layout shift on iOS PWA
>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    <Drawer.Content
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
      {/* form */}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>;
```

---

## Backend

### Stack

- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken) + Passport.js (passport-jwt) + bcrypt
- **AI:** NVIDIA NIM API (OpenAI-compatible) via `openai` package
- **Background Jobs:** node-cron (recurring transactions)
- **Language:** TypeScript

### Auth Flow

- Passwords hashed with **bcrypt**
- Login returns **access token** (short-lived) + **refresh token** (long-lived, stored in DB)
- Refresh tokens stored in `refresh_tokens` table with `revokedAt` support
- 2FA via OTP stored in `users.otp` + `users.otpExpiry`
- Passport JWT strategy protects routes

```typescript
// Auth middleware pattern
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  handler,
);
```

### Database Schema Summary

| Table                    | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `users`                  | User accounts with preferences (currency, timezone, dateFormat, fontFamily) |
| `refresh_tokens`         | JWT refresh tokens with revocation support                                  |
| `account_groups`         | Group accounts (e.g. "Personal", "Business")                                |
| `accounts`               | Bank/cash accounts with opening balance                                     |
| `categories`             | INCOME/EXPENSE categories, can be AI-generated                              |
| `transactions`           | All financial transactions (INCOME, EXPENSE, TRANSFER)                      |
| `recurring_transactions` | Recurring payment templates                                                 |
| `lend_debt`              | Money lent or owed (LEND/DEBT)                                              |
| `lend_debt_payments`     | Partial payments against lend/debt                                          |

**Key Enums:**

```typescript
CategoryType: "INCOME" | "EXPENSE";
TransactionType: "INCOME" | "EXPENSE" | "TRANSFER";
LendDebtType: "LEND" | "DEBT";
LendDebtStatus: "OPEN" | "SETTLED";
RecurrenceFrequency: "DAILY" |
  "WEEKLY" |
  "MONTHLY_START" |
  "MONTHLY_END" |
  "YEARLY";
RecurringStatus: "ACTIVE" | "PAUSED" | "STOPPED";
```

**Important Schema Notes:**

- All IDs are `text` using `crypto.randomUUID()`
- Amounts use `decimal(12, 2)` for precision
- `transactions` has a unique index on `(recurringTransactionId, occurrenceDate)` to prevent duplicate recurring entries
- `transactions.isOverridden` tracks if a recurring-generated transaction was manually edited
- Categories with `isAiGenerated: true` were created by AI categorization
- `users` stores per-user preferences: `currency` (default INR), `timezone`, `dateFormat`, `fontFamily`

### API Structure

```
/api/auth
  POST /register
  POST /login
  POST /refresh
  POST /logout
  POST /2fa/verify

/api/accounts
  GET    /
  POST   /
  GET    /:id
  PUT    /:id
  DELETE /:id

/api/account-groups
  GET    /
  POST   /
  PUT    /:id
  DELETE /:id

/api/categories
  GET    /
  POST   /
  PUT    /:id
  DELETE /:id

/api/transactions
  GET    /
  POST   /          ← triggers AI categorization
  PUT    /:id
  DELETE /:id

/api/recurring
  GET    /
  POST   /
  PUT    /:id
  PATCH  /:id/toggle
  DELETE /:id

/api/lend-debt
  GET    /
  POST   /
  PUT    /:id
  PATCH  /:id/settle
  DELETE /:id

/api/lend-debt/:id/payments
  GET    /
  POST   /
```

### AI Categorization (NVIDIA NIM)

- Model: `meta/llama-3.3-70b-instruct`
- Base URL: `https://integrate.api.nvidia.com/v1` (OpenAI-compatible)
- Automatically categorizes transactions on creation
- Uses user's existing categories + learns from overrides
- Falls back to "Uncategorized" category on failure
- Categories auto-created by AI have `isAiGenerated: true`

```typescript
// lib/nvidia.ts
import OpenAI from "openai";
export const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});
// Always use model: 'meta/llama-3.3-70b-instruct'
// Set max_tokens: 256, temperature: 0.1 for categorization
```

### Recurring Transaction Processor

- Runs via `node-cron` every hour
- Checks `recurringTransactions` where `nextOccurrence <= now` and `status = ACTIVE`
- Creates a transaction entry and updates `nextOccurrence`
- Unique constraint on `(recurringTransactionId, occurrenceDate)` prevents duplicates
- Start in `index.ts` with `startRecurringProcessor()`

### Environment Variables

```env
# Backend
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NVIDIA_API_KEY=        # starts with nvapi-
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Common Patterns

**Always use user ID from JWT, never from request body**

```typescript
const userId = req.user.id; // from passport JWT
```

**Drizzle query pattern**

```typescript
// Find with relations
const result = await db.query.transactions.findMany({
  where: and(eq(transactions.userId, userId), eq(transactions.type, 'EXPENSE')),
  with: { category: true, account: true },
  orderBy: desc(transactions.transactionDate),
});

// Insert and return
const [created] = await db.insert(transactions).values({ ... }).returning();
```

**Transfer transactions**

- Creates two linked transaction records
- Uses `transferToAccountId` to link source and destination accounts
- Type is `TRANSFER` on both

**Decimal handling**

- DB stores as string (Drizzle decimal type)
- Always `parseFloat()` when doing math
- Display with user's preferred currency from `user.currency`
