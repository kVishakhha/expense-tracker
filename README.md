# Expense Tracker

A full-stack expense-management application built with Node.js, Express, PostgreSQL, and a browser-based dashboard. It includes account registration/login, JWT-based authentication, expense CRUD operations, filtering/pagination, and spending reports.

## Features

- Account signup and login
- Password hashing with bcryptjs
- JWT-based authentication
- Create, view, update, and delete expenses
- Filter expenses by category and date range
- Paginated expense listing
- Summary, category, and monthly report endpoints
- PostgreSQL tables initialized by the application

## Tech stack

- Node.js 18+
- Express 4
- PostgreSQL with pg
- JWT (jsonwebtoken)
- bcryptjs
- HTML/CSS/JavaScript dashboard in public/

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- npm

## Run locally

1. Clone the repository and enter its directory.
2. Install dependencies:

   ~~~bash
   npm install
   ~~~

3. Create your local environment file from the template:

   ~~~bash
   cp .env.example .env
   ~~~

   On Windows, copy .env.example to .env using File Explorer or PowerShell.

4. Configure the database connection and a strong JWT secret in .env:

   ~~~env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   JWT_SECRET=replace_with_a_long_random_secret
   PORT=3000
   ~~~

   Keep .env private and never commit real credentials. Generate a secret locally, for example:

   ~~~bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ~~~

5. Start the application:

   ~~~bash
   npm run dev
   ~~~

   The server uses port 3000 by default. Database tables are initialized at startup. If startup fails, check the terminal output and confirm that PostgreSQL is reachable and the environment variables are correct.

## API reference

All routes below use the /api prefix.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /api/auth/signup | Create an account |
| POST | /api/auth/login | Authenticate and receive a JWT |
| GET | /api/auth/me | Return the authenticated user's profile |

### Expenses

Expense routes require a valid bearer token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/expenses | List expenses; supports category/date filters and pagination |
| POST | /api/expenses | Add an expense |
| PUT | /api/expenses/:id | Update an expense owned by the authenticated user |
| DELETE | /api/expenses/:id | Delete an expense owned by the authenticated user |

The list endpoint accepts category, start_date, end_date, page, limit, and sort query parameters.

### Reports

Report routes require a valid bearer token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/reports/summary | Overall spending summary |
| GET | /api/reports/category | Spending grouped by category |
| GET | /api/reports/monthly | Month-by-month spending |

Example authenticated request:

~~~http
GET /api/expenses?page=1&limit=10&sort=desc
Authorization: Bearer YOUR_JWT
~~~

## Project structure

~~~text
config/          PostgreSQL connection and table initialization
controllers/     Authentication, expense, and report handlers
middleware/      JWT authentication middleware
routes/          API route definitions
public/          Browser dashboard
.env.example     Environment variable template
server.js        Application entry point
~~~

## Security notes

The current implementation hashes passwords with bcryptjs, uses parameterized values in database queries, and scopes expense update/delete operations to the authenticated user. These are useful baseline protections, not a claim that the application is production-ready.

Before deploying for real users, review and test production configuration carefully. In particular, use a strong, private JWT_SECRET, validate request inputs and pagination bounds, review database TLS settings, configure appropriate CORS and rate limiting, and avoid exposing sensitive error details. This README documents the existing app; no application code or configuration was changed as part of this documentation update.

## Testing status

The repository's package scripts currently provide npm start and npm run dev; a dedicated automated test command is not configured. Verify the authentication, ownership, CRUD, filter, pagination, and report flows against a non-production database before relying on the application.
