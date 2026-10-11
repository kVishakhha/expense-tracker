# ExpenseFlow — Expense Tracker

ExpenseFlow is a full-stack expense tracker with a browser-based dashboard and a Node.js/Express API backed by PostgreSQL. It supports account registration, JWT-authenticated expense management, and spending summaries.

> **Project status:** This is a learning/portfolio project, not a production-hardened financial application. See the security notes before deploying it publicly.

## Features

- Register and sign in to an account
- Create, list, update, and delete expenses
- Filter expenses by category and date range
- Paginate expense results and sort by date
- View total, monthly, and category-based reports
- Store user passwords as bcrypt hashes
- Restrict expense queries to the authenticated user

## Tech stack

- **Runtime / API:** Node.js 18+, Express
- **Database:** PostgreSQL (pg)
- **Authentication:** JSON Web Tokens (jsonwebtoken)
- **Password hashing:** bcryptjs
- **Frontend:** HTML, CSS, and JavaScript served from public/

## Run locally

### Prerequisites

- Node.js 18 or newer and npm
- A PostgreSQL database (local PostgreSQL or a hosted database such as Neon)

### 1. Clone the repository

~~~bash
git clone https://github.com/kVishakhha/expense-tracker.git
cd expense-tracker
~~~

### 2. Install dependencies

~~~bash
npm install
~~~

### 3. Configure environment variables

Copy the example file:

**macOS / Linux**
~~~bash
cp .env.example .env
~~~

**Windows PowerShell**
~~~powershell
Copy-Item .env.example .env
~~~

Set DATABASE_URL to your PostgreSQL connection string and replace JWT_SECRET with a unique, randomly generated secret. One way to generate a secret is:

~~~bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
~~~

Keep the real .env file private. Never commit database credentials or real JWT secrets.

### 4. Start the server

~~~bash
npm run dev
~~~

The server initializes the database tables at startup and listens on the configured PORT (default: 3000). Open http://localhost:3000 for the dashboard. The health endpoint is GET /api/health.

If startup fails, check that PostgreSQL is reachable and DATABASE_URL is valid. The current database initializer logs initialization errors; a successful server start alone does not prove the database is ready.

## API reference

Base URL for local development: http://localhost:3000.

### Authentication

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | None | Register an account |
| POST | /api/auth/login | None | Sign in and receive a JWT |
| GET | /api/auth/me | Bearer token | Return the current user's profile |

Example registration request:

~~~bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"replace-this-password"}'
~~~

### Expenses

All expense endpoints require Authorization: Bearer <token>.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/expenses | List the current user's expenses |
| POST | /api/expenses | Create an expense |
| PUT | /api/expenses/:id | Update an expense owned by the current user |
| DELETE | /api/expenses/:id | Delete an expense owned by the current user |

Supported list query parameters: category, start_date, end_date, page, limit, and sort (asc or desc).

Example create request:

~~~bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"category":"Food","description":"Lunch","date":"2026-10-12"}'
~~~

### Reports

All report endpoints require a Bearer token.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/reports/summary | All-time total, current-month total, transaction count |
| GET | /api/reports/category | Spending totals grouped by category; optional year and month |
| GET | /api/reports/monthly | Monthly totals; optional year |

## Project structure

~~~text
config/db.js                     PostgreSQL connection and table initialization
controllers/authController.js    Account registration, login, and profile
controllers/expenseController.js Expense CRUD and filtering
controllers/reportController.js  Summary and spending reports
middleware/authMiddleware.js     JWT verification
routes/                          API route definitions
public/index.html                Browser dashboard
server.js                        Express entry point
.env.example                     Environment-variable template
~~~

## Security and limitations

This repository includes some useful baseline controls: bcrypt password hashing, JWT verification, parameterized SQL for user-supplied values, and ownership checks on expense updates/deletes. These controls do **not** make the application production-ready.

Before a public deployment, address at least the following:

- **CORS:** The server currently allows requests from any origin. Configure an explicit origin allowlist.
- **Database TLS:** Production PostgreSQL configuration disables certificate verification with rejectUnauthorized: false. Configure certificate validation rather than relying on this setting for production.
- **Authentication hardening:** Signup currently accepts passwords as short as six characters; add stronger password policy and rate limiting for login/signup.
- **Configuration validation:** Fail fast if DATABASE_URL or JWT_SECRET is missing or insecure.
- **Input validation:** Validate pagination bounds, dates, and all request fields consistently.
- **Operational safety:** Add automated tests, structured logging, and production error handling before deployment.

The repository does not currently define an automated test script in package.json. API examples above are manual smoke-test requests, not evidence of an automated test suite.

## Development

~~~bash
npm run dev
~~~

The npm start command starts the server without the development watcher.

---
Built as a learning project by [Vishakha Khetan](https://github.com/kVishakhha).
