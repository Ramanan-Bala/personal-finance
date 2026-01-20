# Cashly API Documentation

Complete API reference for the Cashly Personal Finance Backend.

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Base URL

```
http://localhost:3000
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123"
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- 400: Invalid email format or password too short
- 409: Email already exists

---

### Login

**POST** `/auth/login`

Authenticate and get tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- 400: Invalid email or password

---

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- 400: Invalid or expired refresh token

---

### Logout

**POST** `/auth/logout`

Revoke refresh token.

**Request Body:**

```json
{
  "refreshToken": "optional_token_to_revoke"
}
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get Profile

**GET** `/users/profile` (Protected)

Get current user's profile.

**Response (200):**

```json
{
  "id": "clxxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Profile

**PATCH** `/users/profile` (Protected)

Update user profile information.

**Request Body:**

```json
{
  "name": "Jane Doe"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "email": "user@example.com",
  "name": "Jane Doe",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Account Groups Endpoints

### Create Account Group

**POST** `/accounts/groups` (Protected)

Create a new account group.

**Request Body:**

```json
{
  "name": "My Bank Accounts",
  "description": "All my personal bank accounts"
}
```

**Response (201):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "name": "My Bank Accounts",
  "description": "All my personal bank accounts",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Account Groups

**GET** `/accounts/groups` (Protected)

List all account groups.

**Response (200):**

```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "name": "My Bank Accounts",
    "description": "All my personal bank accounts",
    "accounts": [],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Update Account Group

**PATCH** `/accounts/groups/:groupId` (Protected)

Update an account group.

**Request Body:**

```json
{
  "name": "Personal Accounts",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "name": "Personal Accounts",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Account Group

**DELETE** `/accounts/groups/:groupId` (Protected)

Delete an account group.

**Response (200):**

```json
{
  "message": "Account group deleted"
}
```

**Errors:**

- 404: Account group not found

---

## Account Endpoints

### Create Account

**POST** `/accounts` (Protected)

Create a new financial account.

**Request Body:**

```json
{
  "groupId": "clxxxxx",
  "name": "Savings Account",
  "openingBalance": 5000.0,
  "description": "Primary savings account"
}
```

**Response (201):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "groupId": "clxxxxx",
  "name": "Savings Account",
  "openingBalance": "5000.00",
  "description": "Primary savings account",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get All Accounts

**GET** `/accounts` (Protected)

List all accounts.

**Response (200):**

```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "groupId": "clxxxxx",
    "name": "Savings Account",
    "openingBalance": "5000.00",
    "description": "Primary savings account",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Account Details

**GET** `/accounts/:accountId` (Protected)

Get specific account details.

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "groupId": "clxxxxx",
  "name": "Savings Account",
  "openingBalance": "5000.00",
  "description": "Primary savings account",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Errors:**

- 404: Account not found

---

### Update Account

**PATCH** `/accounts/:accountId` (Protected)

Update account details.

**Request Body:**

```json
{
  "name": "Emergency Fund",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "groupId": "clxxxxx",
  "name": "Emergency Fund",
  "openingBalance": "5000.00",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Account

**DELETE** `/accounts/:accountId` (Protected)

Delete an account.

**Response (200):**

```json
{
  "message": "Account deleted"
}
```

**Errors:**

- 404: Account not found
- 400: Cannot delete account with transactions

---

## Category Endpoints

### Create Category

**POST** `/categories` (Protected)

Create a new category.

**Request Body:**

```json
{
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "🛒",
  "description": "Food and grocery items"
}
```

**Response (201):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "🛒",
  "description": "Food and grocery items",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Categories

**GET** `/categories` (Protected)

List all categories.

**Query Parameters:**

- `type` (optional): Filter by type (INCOME or EXPENSE)

**Response (200):**

```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "name": "Groceries",
    "type": "EXPENSE",
    "icon": "🛒",
    "description": "Food and grocery items",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Category Details

**GET** `/categories/:categoryId` (Protected)

Get specific category.

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "🛒",
  "description": "Food and grocery items",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Category

**PATCH** `/categories/:categoryId` (Protected)

Update category.

**Request Body:**

```json
{
  "name": "Food & Groceries",
  "icon": "🍎"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "name": "Food & Groceries",
  "type": "EXPENSE",
  "icon": "🍎",
  "description": "Food and grocery items",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Category

**DELETE** `/categories/:categoryId` (Protected)

Delete a category.

**Response (200):**

```json
{
  "message": "Category deleted"
}
```

**Errors:**

- 404: Category not found
- 400: Cannot delete category with transactions

---

## Transaction Endpoints

### Create Transaction

**POST** `/transactions` (Protected)

Create a new transaction.

**Request Body (INCOME/EXPENSE):**

```json
{
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "type": "INCOME",
  "amount": 5000.0,
  "transactionDate": "2024-01-15T10:00:00Z",
  "notes": "Monthly salary"
}
```

**Request Body (TRANSFER):**

```json
{
  "accountId": "clxxxxx",
  "type": "TRANSFER",
  "amount": 1000.0,
  "transactionDate": "2024-01-15T10:00:00Z",
  "transferToAccountId": "clxxxxx",
  "notes": "Transfer to savings"
}
```

**Response (201):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "type": "INCOME",
  "amount": "5000.00",
  "transactionDate": "2024-01-15T10:00:00Z",
  "notes": "Monthly salary",
  "transferToAccountId": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Transactions

**GET** `/transactions` (Protected)

List transactions with filtering options.

**Query Parameters:**

- `accountId` (optional): Filter by account
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Examples:**

```
GET /transactions?accountId=clxxxxx
GET /transactions?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z
```

**Response (200):**

```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "accountId": "clxxxxx",
    "categoryId": "clxxxxx",
    "type": "INCOME",
    "amount": "5000.00",
    "transactionDate": "2024-01-15T10:00:00Z",
    "notes": "Monthly salary",
    "transferToAccountId": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Transaction Details

**GET** `/transactions/:transactionId` (Protected)

Get specific transaction.

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "type": "INCOME",
  "amount": "5000.00",
  "transactionDate": "2024-01-15T10:00:00Z",
  "notes": "Monthly salary",
  "transferToAccountId": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Transaction

**PATCH** `/transactions/:transactionId` (Protected)

Update transaction.

**Request Body:**

```json
{
  "amount": 5100.0,
  "notes": "Updated salary amount"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "accountId": "clxxxxx",
  "categoryId": "clxxxxx",
  "type": "INCOME",
  "amount": "5100.00",
  "transactionDate": "2024-01-15T10:00:00Z",
  "notes": "Updated salary amount",
  "transferToAccountId": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Transaction

**DELETE** `/transactions/:transactionId` (Protected)

Delete a transaction.

**Response (200):**

```json
{
  "message": "Transaction deleted"
}
```

---

## Ledger Endpoints

### Get Daily Summary

**GET** `/ledger/daily-summary` (Protected)

Get daily income/expense summary.

**Query Parameters:**

- `from` (optional): Start date (ISO 8601) - defaults to 30 days ago
- `to` (optional): End date (ISO 8601) - defaults to today

**Examples:**

```
GET /ledger/daily-summary
GET /ledger/daily-summary?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z
```

**Response (200):**

```json
[
  {
    "date": "2024-01-15",
    "income": 5000.0,
    "expense": 150.0,
    "netBalance": 4850.0
  },
  {
    "date": "2024-01-16",
    "income": 0.0,
    "expense": 50.0,
    "netBalance": -50.0
  }
]
```

---

### Get Account Balance

**GET** `/ledger/account/:accountId/balance` (Protected)

Get current balance of an account.

**Response (200):**

```json
{
  "accountId": "clxxxxx",
  "balance": 5700.0
}
```

---

### Get All Account Balances

**GET** `/ledger/accounts/balances` (Protected)

Get balances for all user accounts.

**Response (200):**

```json
{
  "clxxxxx": 5700.0,
  "clyyyyy": 2500.0,
  "clzzzzz": 1200.0
}
```

---

## Lend/Debt Endpoints

### Create Lend/Debt

**POST** `/lend-debt` (Protected)

Create a new lend or debt record.

**Request Body:**

```json
{
  "type": "LEND",
  "personName": "John Doe",
  "amount": 200.0,
  "dueDate": "2024-02-15T00:00:00Z",
  "notes": "Borrowed for coffee machine"
}
```

**Response (201):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "type": "LEND",
  "personName": "John Doe",
  "amount": "200.00",
  "dueDate": "2024-02-15T00:00:00Z",
  "status": "OPEN",
  "notes": "Borrowed for coffee machine",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Lend/Debt Records

**GET** `/lend-debt` (Protected)

List all lend/debt records.

**Response (200):**

```json
[
  {
    "id": "clxxxxx",
    "userId": "clxxxxx",
    "type": "LEND",
    "personName": "John Doe",
    "amount": "200.00",
    "dueDate": "2024-02-15T00:00:00Z",
    "status": "OPEN",
    "notes": "Borrowed for coffee machine",
    "outstanding": 200.0,
    "payments": [],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Lend/Debt Details

**GET** `/lend-debt/:id` (Protected)

Get specific lend/debt record with payments.

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "type": "LEND",
  "personName": "John Doe",
  "amount": "200.00",
  "dueDate": "2024-02-15T00:00:00Z",
  "status": "OPEN",
  "notes": "Borrowed for coffee machine",
  "outstanding": 150.0,
  "payments": [
    {
      "id": "clyyyyyyy",
      "amount": "50.00",
      "paymentDate": "2024-01-15T10:00:00Z",
      "notes": "Partial payment"
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Lend/Debt

**PATCH** `/lend-debt/:id` (Protected)

Update lend/debt record.

**Request Body:**

```json
{
  "personName": "John Smith",
  "dueDate": "2024-02-28T00:00:00Z"
}
```

**Response (200):**

```json
{
  "id": "clxxxxx",
  "userId": "clxxxxx",
  "type": "LEND",
  "personName": "John Smith",
  "amount": "200.00",
  "dueDate": "2024-02-28T00:00:00Z",
  "status": "OPEN",
  "notes": "Borrowed for coffee machine",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Lend/Debt

**DELETE** `/lend-debt/:id` (Protected)

Delete a lend/debt record.

**Response (200):**

```json
{
  "message": "Lend/Debt deleted"
}
```

---

### Create Payment

**POST** `/lend-debt/payments` (Protected)

Record a payment toward lend/debt.

**Request Body:**

```json
{
  "lendDebtId": "clxxxxx",
  "amount": 100.0,
  "paymentDate": "2024-01-20T10:00:00Z",
  "notes": "Partial payment"
}
```

**Response (201):**

```json
{
  "id": "clyyyyyyy",
  "userId": "clxxxxx",
  "lendDebtId": "clxxxxx",
  "amount": "100.00",
  "paymentDate": "2024-01-20T10:00:00Z",
  "notes": "Partial payment",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

---

### Get Payment Details

**GET** `/lend-debt/payments/:paymentId` (Protected)

Get specific payment record.

**Response (200):**

```json
{
  "id": "clyyyyyyy",
  "userId": "clxxxxx",
  "lendDebtId": "clxxxxx",
  "amount": "100.00",
  "paymentDate": "2024-01-20T10:00:00Z",
  "notes": "Partial payment",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

---

### Update Payment

**PATCH** `/lend-debt/payments/:paymentId` (Protected)

Update a payment record.

**Request Body:**

```json
{
  "amount": 120.0,
  "notes": "Updated payment amount"
}
```

**Response (200):**

```json
{
  "id": "clyyyyyyy",
  "userId": "clxxxxx",
  "lendDebtId": "clxxxxx",
  "amount": "120.00",
  "paymentDate": "2024-01-20T10:00:00Z",
  "notes": "Updated payment amount",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

---

### Delete Payment

**DELETE** `/lend-debt/payments/:paymentId` (Protected)

Delete a payment record.

**Response (200):**

```json
{
  "message": "Payment deleted"
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "errors": ["amount must be positive"],
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/transactions"
}
```

**401 Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Invalid or missing token",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/accounts"
}
```

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Account not found",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/accounts/clxxxxx"
}
```

**409 Conflict:**

```json
{
  "statusCode": 409,
  "message": "Email already in use",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/auth/register"
}
```

**500 Internal Server Error:**

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/transactions"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, add rate limiting via:

- `@nestjs/throttler` package
- API gateway (AWS API Gateway, nginx, etc.)

---

## Pagination (Future)

For large result sets, pagination will be implemented as:

```
GET /transactions?limit=20&offset=0
```

Response will include:

```json
{
  "data": [...],
  "total": 1000,
  "limit": 20,
  "offset": 0
}
```
