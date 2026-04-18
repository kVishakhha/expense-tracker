# 💰 ExpenseFlow — Full-Stack Expense Tracker

A production-ready expense tracker built with **Node.js + Express + PostgreSQL + JWT Auth**.

---

## ✅ STEP-BY-STEP SETUP GUIDE

---

### STEP 1 — Create a FREE PostgreSQL Database (Neon.tech)

1. Go to **https://neon.tech** → Sign up for free
2. Click **"New Project"** → Name it `expense-tracker`
3. After creation, find the **Connection String** — looks like:
   ```
   postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy it** — you'll need it in Step 3

---

### STEP 2 — Download & Install Dependencies

```bash
# 1. Open a terminal and go into the project folder
cd expense-tracker

# 2. Install all packages
npm install
```

---

### STEP 3 — Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Now open `.env` in any text editor and fill it in:

```env
DATABASE_URL=postgresql://your_neon_connection_string_here
JWT_SECRET=make_up_any_long_random_string_here
PORT=3000
```

**To generate a strong JWT secret, run this in terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### STEP 4 — Run the Project Locally

```bash
npm run dev
```

You should see:
```
✅ Database tables ready
🚀 Server running on http://localhost:3000
```

Open **http://localhost:3000** in your browser — you'll see the dashboard!

---

### STEP 5 — Test the APIs (Optional, using Postman)

Import these into Postman:

#### Signup
```
POST http://localhost:3000/api/auth/signup
Body (JSON): { "name": "John", "email": "john@test.com", "password": "123456" }
```

#### Login
```
POST http://localhost:3000/api/auth/login
Body (JSON): { "email": "john@test.com", "password": "123456" }
```
👉 Copy the `token` from the response

#### Add Expense (requires token)
```
POST http://localhost:3000/api/expenses
Header: Authorization: Bearer <your_token>
Body: { "amount": 500, "category": "Food", "description": "Lunch", "date": "2024-01-15" }
```

#### Get Expenses (with filters)
```
GET http://localhost:3000/api/expenses?category=Food&page=1&limit=10&sort=desc
Header: Authorization: Bearer <your_token>
```

#### Category Report
```
GET http://localhost:3000/api/reports/category?year=2024
Header: Authorization: Bearer <your_token>
```

---

### STEP 6 — Deploy to Railway (FREE)

1. **Push code to GitHub first:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/yourusername/expense-tracker.git
   git push -u origin main
   ```

2. **Go to https://railway.app** → Sign in with GitHub

3. Click **"New Project"** → **"Deploy from GitHub repo"** → Select your repo

4. Railway auto-detects Node.js and deploys!

5. **Add environment variables in Railway:**
   - Go to your project → **Variables** tab
   - Add: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`

6. Your app will be live at `https://your-app.railway.app` 🎉

---

## 📁 Project Structure

```
expense-tracker/
├── config/
│   └── db.js                  ← PostgreSQL connection + table creation
├── controllers/
│   ├── authController.js      ← Signup, Login, Get Me
│   ├── expenseController.js   ← CRUD operations
│   └── reportController.js    ← Analytics queries
├── middleware/
│   └── authMiddleware.js      ← JWT verification
├── routes/
│   ├── authRoutes.js
│   ├── expenseRoutes.js
│   └── reportRoutes.js
├── public/
│   └── index.html             ← Frontend dashboard
├── .env.example
├── .gitignore
├── package.json
└── server.js                  ← Entry point
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Expenses (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses | List expenses (paginated, filterable) |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |

**Query params for GET:** `category`, `start_date`, `end_date`, `page`, `limit`, `sort`

### Reports (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/summary | Total, monthly, count |
| GET | /api/reports/category | Spending by category |
| GET | /api/reports/monthly | Month-by-month totals |

---

## 🧠 Interview Talking Points

- **MVC Architecture**: Routes → Controllers → DB layer (no SQL in routes)
- **JWT Auth**: Stateless authentication with middleware protection
- **Foreign Keys**: `expenses.user_id` references `users.id` with CASCADE delete
- **Aggregation Queries**: `GROUP BY`, `SUM()`, `DATE_TRUNC` for reports
- **Pagination**: `LIMIT` + `OFFSET` pattern
- **Filtering**: Dynamic `WHERE` clause construction with parameterized queries (SQL injection safe)
- **Password Security**: bcrypt hashing (never store plain passwords)
- **Environment Variables**: Secrets kept out of code via `.env`

---

## 🚀 Upgrade Ideas

- [ ] Budget alerts (if spending > budget threshold)
- [ ] CSV export of expenses
- [ ] Email notifications
- [ ] Recurring expense tracking
- [ ] Multi-currency support
