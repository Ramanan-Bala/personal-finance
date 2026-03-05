# Cashly Dashboard — Implementation Plan

> **For Factory Droid**: Follow this plan file-by-file, in order. Do not skip steps. Each section tells you exactly what to build, what patterns to follow, and what logic to implement.

---

## Project Context

- **Stack**: Express + TypeScript + Drizzle ORM + PostgreSQL (backend), Next.js 16 + Zustand + Axios + Recharts (frontend)
- **Auth**: JWT via passport-jwt — `authMiddleware` extracts `userId` from `jwt_payload.sub`
- **Module pattern**: `{feature}.schema.ts` → `{feature}.service.ts` → `{feature}.controller.ts` → `{feature}.routes.ts`
- **Money**: `decimal(12, 2)` in DB — always pass as strings to Drizzle, parse as `Number()` in service
- **Balance**: `accounts.openingBalance` is the **live running balance** (updated on every transaction create/update/delete). It is NOT a starting balance — it is always current.
- **Existing endpoints to reuse**:
  - `GET /api/accounts/groups` — returns groups with nested accounts (each has `openingBalance` as live balance)
  - `GET /api/transactions?from=&to=` — returns transactions filtered by date range with category + account
  - `GET /api/transactions?from=&to=` with `withAdditional=true` (already supported in service) — includes account + category + transferAccount

---

## What We're Building

### Dashboard Cards (global month filter controls all)

1. **Total Available Balance** — sum of all `accounts.openingBalance` (live, not month-filtered)
2. **Monthly Income** — sum of `INCOME` transactions in selected month
3. **Monthly Expense** — sum of `EXPENSE` transactions in selected month
4. **Net Savings** — Income minus Expense for selected month + savings rate %
5. **Per-Account Balance Cards** — each account's live balance + % change vs last month

### Dashboard Charts (all filtered by selected month, except Income vs Expense)

6. **Income vs Expense Bar Chart** — last 6 months side-by-side (Recharts `BarChart`)
7. **Spending by Category Donut** — EXPENSE breakdown by category for selected month (Recharts `PieChart`)
8. **Income by Category Donut** — INCOME breakdown by category for selected month (Recharts `PieChart`)
9. **Daily Spending Line Chart** — day-by-day EXPENSE for selected month (Recharts `LineChart`)

### Dashboard Lists

10. **Last 10 Transactions** — most recent across all accounts

### New Backend Endpoint Needed

- `GET /api/dashboard/summary?from=&to=` — aggregated stats the frontend cannot efficiently compute client-side (6-month history, category breakdowns, daily spending). Everything else reuses existing endpoints.

---

## Step 1 — Backend: `dashboard.schema.ts`

**File**: `back-end/src/modules/dashboard/dashboard.schema.ts`

```typescript
import { z } from "zod";

export const dashboardQuerySchema = z.object({
  from: z.string().min(1), // ISO date string e.g. "2025-03-01"
  to: z.string().min(1), // ISO date string e.g. "2025-03-31"
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
```

---

## Step 2 — Backend: `dashboard.service.ts`

**File**: `back-end/src/modules/dashboard/dashboard.service.ts`

**Imports needed**: `db` from `../../db`, `transactions`, `accounts`, `categories` from `../../db/schema`, `eq`, `and`, `between`, `gte`, `lte`, `sql` from `drizzle-orm`, `subMonths`, `startOfMonth`, `endOfMonth` from `date-fns`

### Method: `getSummary(userId: string, from: Date, to: Date)`

Returns a single object with all dashboard data. Logic:

#### A. Six-month Income vs Expense

- Loop last 6 months (from `to` date going back). For each month:
  - Query `transactions` where `userId`, `transactionDate` between month start/end
  - Sum `amount` where `type = 'INCOME'` → `income`
  - Sum `amount` where `type = 'EXPENSE'` → `expense`
  - Return array: `[{ month: "Jan", income: 0, expense: 0 }, ...]` (6 items, oldest first)

#### B. Selected Month Income/Expense/Net

- Query transactions between `from` and `to`
- Sum INCOME amounts → `monthlyIncome`
- Sum EXPENSE amounts → `monthlyExpense`
- `netSavings = monthlyIncome - monthlyExpense`
- `savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0`

#### C. Spending by Category (Donut)

- Query EXPENSE transactions between `from` and `to`, with category joined
- Group by `categoryId` + `category.name`
- Return: `[{ categoryId, name, amount, percentage }]` sorted desc by amount

#### D. Income by Category (Donut)

- Same as C but for INCOME transactions

#### E. Daily Spending (Line Chart)

- Query EXPENSE transactions between `from` and `to`
- Group by day (`transactionDate` truncated to date)
- Return: `[{ day: "2025-03-01", amount: 0 }]` for every day in range (fill 0 for days with no spend)

#### F. Last Month Income/Expense (for % change on account cards)

- Compute last month's `from`/`to` relative to the selected month
- Sum INCOME and EXPENSE for last month
- Return `lastMonthIncome` and `lastMonthExpense`

> **Note**: Total balance and per-account balances come from `GET /api/accounts/groups` (frontend reuses that). Last 10 transactions come from `GET /api/transactions?from=&to=` (frontend already has this). Do NOT duplicate those in the dashboard endpoint.

### Return shape:

```typescript
{
  sixMonthTrend: Array<{ month: string; income: number; expense: number }>;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  spendingByCategory: Array<{
    categoryId: string;
    name: string;
    amount: number;
    percentage: number;
  }>;
  incomeByCategory: Array<{
    categoryId: string;
    name: string;
    amount: number;
    percentage: number;
  }>;
  dailySpending: Array<{ day: string; amount: number }>;
  lastMonthIncome: number;
  lastMonthExpense: number;
}
```

---

## Step 3 — Backend: `dashboard.controller.ts`

**File**: `back-end/src/modules/dashboard/dashboard.controller.ts`

Pattern: follow `back-end/src/modules/transactions/transactions.controller.ts`

```typescript
// getSummary handler
// 1. Extract userId from req.user (jwt_payload.sub)
// 2. Validate query params with dashboardQuerySchema
// 3. Parse from/to as new Date(from) and new Date(to)
// 4. Call dashboardService.getSummary(userId, from, to)
// 5. Return res.json(result)
// Wrap in try/catch → res.status(500).json({ error: e.message })
```

---

## Step 4 — Backend: `dashboard.routes.ts`

**File**: `back-end/src/modules/dashboard/dashboard.routes.ts`

```typescript
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { dashboardController } from "./dashboard.controller";

const router = Router();
router.get("/summary", authMiddleware, dashboardController.getSummary);
export default router;
```

---

## Step 5 — Backend: Register Route

**File**: `back-end/src/routes.ts`

Add:

```typescript
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
// inside the router:
router.use("/dashboard", dashboardRoutes);
```

---

## Step 6 — Frontend: Types

**File**: `cashly-next/src/shared/types/dashboard.ts`

```typescript
export interface SixMonthTrendItem {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface DailySpendingItem {
  day: string; // "2025-03-01"
  amount: number;
}

export interface DashboardSummary {
  sixMonthTrend: SixMonthTrendItem[];
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  spendingByCategory: CategoryBreakdownItem[];
  incomeByCategory: CategoryBreakdownItem[];
  dailySpending: DailySpendingItem[];
  lastMonthIncome: number;
  lastMonthExpense: number;
}
```

Export from `cashly-next/src/shared/index.ts`:

```typescript
export * from "./types/dashboard";
```

---

## Step 7 — Frontend: Dashboard Page

**File**: `cashly-next/src/app/(home)/dashboard/page.tsx`

### State

```typescript
const [currentMonth, setCurrentMonth] = useState(new Date());
const [summary, setSummary] = useState<DashboardSummary | null>(null);
const [accounts, setAccounts] = useState<AccountGroup[]>([]);
const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
```

### Date Range (same pattern as ledger page)

```typescript
const dateRange = useMemo(
  () => ({
    from: startOfMonth(currentMonth),
    to: endOfMonth(currentMonth),
  }),
  [currentMonth],
);
```

### Data Fetching

Fetch all three in parallel with `Promise.all`:

1. `GET /api/dashboard/summary?from=<ISO>&to=<ISO>` → `setSummary`
2. `GET /api/accounts/groups` → `setAccounts`
3. `GET /api/transactions?from=<ISO>&to=<ISO>` (take first 10, sorted desc) → `setRecentTransactions`

Re-fetch on `dateRange` change (useEffect dependency).

### Computed Values (from accounts data)

```typescript
const totalBalance = useMemo(
  () =>
    accounts.reduce(
      (sum, group) =>
        sum + group.accounts.reduce((s, a) => s + Number(a.openingBalance), 0),
      0,
    ),
  [accounts],
);
```

Per-account % change vs last month:

- Use `summary.lastMonthIncome` and `summary.lastMonthExpense` as a proxy for net flow
- For each account: `percentChange = ((currentBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100`
- Since we don't store historical per-account balances, approximate: show the account's current balance with a green/red badge based on whether the selected month had net positive or negative transactions for that account (compute from `recentTransactions` filtered by `accountId`)

### Month Navigator (same as ledger page)

```typescript
<IconButton onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}><ChevronLeft /></IconButton>
<Text>{format(currentMonth, 'MMMM yyyy')}</Text>
<IconButton onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}><ChevronRight /></IconButton>
```

---

## Step 8 — Frontend: Dashboard UI Layout

### Layout Structure

```
[Month Navigator — top right]

[Card Row 1: Total Balance | Monthly Income | Monthly Expense | Net Savings]

[Account Cards Row — horizontal scroll]

[Chart Row: Income vs Expense Bar (full width)]

[Chart Row: Spending Donut | Income Donut | Daily Spending Line]

[Last 10 Transactions Table]
```

### Card 1: Total Balance

- Large number, wallet icon
- Label: "Total Available Balance"
- No month filter (always live)

### Card 2: Monthly Income

- Green color, TrendingUp icon
- Value: `formatCurrency(summary.monthlyIncome)`

### Card 3: Monthly Expense

- Red color, TrendingDown icon
- Value: `formatCurrency(summary.monthlyExpense)`

### Card 4: Net Savings

- Blue/green if positive, red if negative
- Value: `formatCurrency(summary.netSavings)`
- Sub-label: `Savings rate: {summary.savingsRate.toFixed(1)}%`

### Account Cards (horizontal scroll row)

For each account across all groups:

```
[Account Name]
[Current Balance — large]
[+X.X% vs last month badge — green/red]
```

Compute per-account monthly net: filter `recentTransactions` by `accountId`, sum INCOME - EXPENSE for that account. If positive → green badge. If negative → red badge. Show the % relative to `openingBalance`.

### Chart 1: Income vs Expense (BarChart — full width)

```typescript
<BarChart data={summary.sixMonthTrend}>
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
  <Legend />
  <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4,4,0,0]} />
  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4,4,0,0]} />
</BarChart>
```

Wrap in `<ResponsiveContainer width="100%" height={300}>`

### Chart 2: Spending by Category (PieChart — donut)

```typescript
<PieChart>
  <Pie
    data={summary.spendingByCategory}
    dataKey="amount"
    nameKey="name"
    innerRadius={60}
    outerRadius={100}
  >
    {summary.spendingByCategory.map((_, i) => (
      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
  <Legend />
</PieChart>
```

Define at top of file:

```typescript
const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];
```

### Chart 3: Income by Category (PieChart — same pattern as Chart 2, use `summary.incomeByCategory`)

### Chart 4: Daily Spending (LineChart)

```typescript
<LineChart data={summary.dailySpending}>
  <XAxis dataKey="day" tickFormatter={(d) => format(new Date(d), 'dd')} />
  <YAxis />
  <Tooltip labelFormatter={(d) => format(new Date(d), 'dd MMM')} formatter={(val) => formatCurrency(Number(val))} />
  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} />
</LineChart>
```

### Last 10 Transactions

Render a simple list (not a full table):

```
[Category Icon] [Notes or "Transfer"] [Account Name]   [+/- Amount] [Date]
```

- INCOME: green amount
- EXPENSE: red amount
- TRANSFER: blue/gray amount
- Use `ICON_MAP` from shared for category icons (same as ledger page)
- Show Skeleton when loading

---

## Step 9 — Frontend: Recharts Install Check

**Check** `cashly-next/package.json` — if `recharts` is not listed, add it:

```bash
npm install recharts
```

Recharts is already available in the artifact environment but confirm it's in package.json for production builds.

---

## Step 10 — Frontend: Skeleton Loading States

When `loading === true`, render `<Skeleton>` (Radix UI) in place of:

- Each stat card value
- Each chart area (fixed height div with Skeleton)
- Each transaction row

Use the same Skeleton pattern as `cashly-next/src/app/(home)/ledger/page.tsx`.

---

## Step 11 — Frontend: Empty States

- If `summary.spendingByCategory.length === 0` → show `<EmptyState>` inside the donut chart area
- If `recentTransactions.length === 0` → show `<EmptyState>` in the transactions section
- Import `EmptyState` from `@/shared`

---

## Key Conventions to Follow

| Convention        | Rule                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Money display     | Always use `formatCurrency()` from `useFormatter()` hook                                                       |
| Date formatting   | Always use `formatDate()` from `useFormatter()` or `date-fns` `format()`                                       |
| API calls         | Use `api` from `@/lib/api/axios` (auto adds auth header)                                                       |
| Animations        | Wrap sections in `<motion.div>` with `variants={fadeInVariants}` or `staggerContainerVariants` from `@/shared` |
| Toast             | Set `{ showSuccessToast: true }` in api call options if needed                                                 |
| Decimal precision | `Number(amount)` when reading from API, never raw string math                                                  |
| Page header       | Use `<PageHeader>` component from `@/shared`                                                                   |
| Error handling    | `try/catch` in every fetch, `console.error` for now                                                            |

---

## Files to Create (in order)

| #   | File                                                     | Action                        |
| --- | -------------------------------------------------------- | ----------------------------- |
| 1   | `back-end/src/modules/dashboard/dashboard.schema.ts`     | Create                        |
| 2   | `back-end/src/modules/dashboard/dashboard.service.ts`    | Create                        |
| 3   | `back-end/src/modules/dashboard/dashboard.controller.ts` | Create                        |
| 4   | `back-end/src/modules/dashboard/dashboard.routes.ts`     | Create                        |
| 5   | `back-end/src/routes.ts`                                 | Edit — add dashboard route    |
| 6   | `cashly-next/src/shared/types/dashboard.ts`              | Create                        |
| 7   | `cashly-next/src/shared/index.ts`                        | Edit — export dashboard types |
| 8   | `cashly-next/src/app/(home)/dashboard/page.tsx`          | Create                        |

---

## Notes for Droid

- `accounts.openingBalance` is the **live current balance** in Cashly — it is always up to date. Do NOT calculate balance from transactions; just read it directly.
- The `getTransactionsByDateRange` method in `transactions.service.ts` already accepts `withAdditional` boolean — use it in the dashboard service for richer queries if needed.
- For the 6-month trend, use plain SQL aggregation with `sql` from drizzle-orm rather than fetching all transactions and computing in JS — it's more efficient.
- Daily spending array must include **every day** in the month even if amount is 0 — fill gaps in the service before returning.
- The frontend `dateRange.from` and `dateRange.to` should be passed as ISO strings in the query params: `from.toISOString()` and `to.toISOString()`.
