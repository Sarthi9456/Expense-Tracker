# Expense Tracker

## Project Title & Description

This project is a submission for **Exercise 2: Mini Expense Tracker** from the Studio Graphene
Full Stack Developer assessment. It is a full-stack web app where a user can log daily expenses
across categories (Food, Transport, Bills, Entertainment, Other), view and filter their expense
history, see a summary of their spending (total this month, totals per category, and the highest
single expense), view a category breakdown via a pie chart, and export a month's expenses as a
CSV file.

The brief said authentication was not required, but this project includes a simple JWT-based
login/register flow so that each user only sees their own expenses. This was extra scope beyond
the brief — see **Next Steps** for thoughts on this.

## Live Demo Links

- **Frontend (app):** https://expense-tracker-frontend-ebon-chi.vercel.app
- **Backend (API):** https://expense-tracker-backend-eight-psi.vercel.app

You can register a new account on the live site and start adding expenses immediately.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, simple build tooling, functional components with hooks |
| UI | Material UI (MUI) v5 | Ready-made accessible components (forms, tables, selects) so the UI looks clean without custom CSS |
| Charts | Chart.js + react-chartjs-2 | Simple pie chart for the category breakdown |
| HTTP client | Axios | Simple request/response handling and interceptors for the auth token |
| Backend | Node.js + Express | Lightweight REST API framework |
| Validation | Zod | Schema-based request validation with clear error messages |
| Auth | JWT (jsonwebtoken) + bcryptjs | Stateless auth and secure password hashing |
| Database | MongoDB (Mongoose) | The brief allows in-memory/JSON/SQLite, but MongoDB Atlas (free tier) was used so the deployed app has real persistence across restarts |
| Deployment | Vercel (both frontend and backend as separate projects) | Free, simple to connect to GitHub for continuous deployment |

## How to Run Locally

You only need [Node.js](https://nodejs.org/) (v18+) installed. The app uses MongoDB — you can
either point it at a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or run
MongoDB locally if you have it installed.

### 1. Clone the repository

```bash
git clone https://github.com/Sarthi9456/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

> If you don't have MongoDB installed locally, replace `MONGODB_URI` with a free MongoDB Atlas
> connection string (`mongodb+srv://...`).

Start the backend:

```bash
npm run dev
```

The API will run at `http://localhost:5000`. Visit `http://localhost:5000/health` — it should
return `{"ok":true}`.

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`, register a new account, and start adding expenses.

## API Documentation

All `/api/expenses` and `/api/reports` routes require an `Authorization: Bearer <token>` header,
obtained from `/api/auth/login` or `/api/auth/register`.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ "email": string, "password": string (min 6 chars) }` | `201 { "token": string, "user": { "id": string, "email": string } }` |
| POST | `/api/auth/login` | `{ "email": string, "password": string }` | `200 { "token": string, "user": { "id": string, "email": string } }` |

### Expenses

| Method | Path | Body / Query | Response |
|---|---|---|---|
| GET | `/api/expenses` | Query (optional): `category`, `from`, `to` (ISO date strings) | `200 { "expenses": Expense[] }` — sorted by date, newest first |
| POST | `/api/expenses` | `{ "amount": number (>0), "category": string, "date": "YYYY-MM-DD" (not in the future), "description"?: string }` | `201 { "expense": Expense }` |
| PUT | `/api/expenses/:id` | Same body as POST | `200 { "expense": Expense }` or `404` if not found / not owned by user |
| DELETE | `/api/expenses/:id` | — | `200 { "message": "Deleted" }` or `404` |

`Expense` shape:
```json
{
  "_id": "string",
  "userId": "string",
  "amount": 0,
  "category": "Food | Transport | Bills | Entertainment | Other",
  "date": "ISO date string",
  "description": "string"
}
```

### Reports

| Method | Path | Query | Response |
|---|---|---|---|
| GET | `/api/reports/monthly` | `year`, `month` (1-12, required) | `200 { "total": number, "byCategory": { [category]: number }, "expensesCount": number, "highest": Expense \| null }` |
| GET | `/api/reports/export/csv` | `year`, `month` (required) | CSV file download (`Content-Type: text/csv`) of that month's expenses |

## Project Structure

```
Expense-Tracker/
├── backend/
│   ├── api/
│   │   └── index.js          # Vercel serverless entry point
│   ├── src/
│   │   ├── app.js             # Express app, middleware, routes, DB connection
│   │   ├── server.js          # Local dev entry point (app.listen)
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js        # Mongoose user schema
│   │   │   └── Expense.js     # Mongoose expense schema
│   │   ├── routes/
│   │   │   ├── auth.js        # /api/auth/register, /login
│   │   │   ├── expenses.js    # /api/expenses CRUD + filters
│   │   │   └── reports.js     # /api/reports/monthly, /export/csv
│   │   └── utils/
│   │       └── connectMongo.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance with auth token interceptor
│   │   ├── components/
│   │   │   └── ExpenseForm.jsx  # Add/edit form with validation & category dropdown
│   │   ├── pages/
│   │   │   ├── Expenses.jsx     # Main page: form, summary panel, filters, table
│   │   │   ├── Reports.jsx      # Monthly report, pie chart, CSV export
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── format.js        # Currency formatting & date-range helpers
│   │   ├── App.jsx               # Routing & layout
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json               # SPA rewrite rule for client-side routing
│   └── package.json
└── vercel.json
```

## Next Steps

What I chose not to do, and what I'd build next with more time:

- **Per-category budgets** — the "nice to have" budget feature with a visual indicator for
  overspending was not implemented.
- **Recently viewed shortcuts** — a "recently viewed month" shortcut list for the Reports page
  would be a nice addition.
- **Tests** — the project currently has no automated tests. I'd add Jest/Vitest tests for the
  backend validation logic (e.g. rejecting negative amounts and future dates) and for the
  monthly report aggregation (`byCategory`, `highest`).
- **Custom date range filter on Reports page** — the Expenses page supports This month / Last
  month / Custom range filters, but the Reports page is still month-by-month only.
- **Code-splitting** — the production bundle is currently a single ~580KB JS file (mostly MUI +
  Chart.js). I'd lazy-load the Reports page and chart library to reduce the initial bundle size.
- **Authentication was extra scope** — the brief said "assume one user, no auth needed". I added
  JWT auth so the live demo can support multiple people trying it out without seeing each
  other's data, but a reviewer focused purely on the brief's core requirements can register a
  single account and use the app exactly as described.

## Honesty Notes

- The backend connection-handling code (`connectDB` middleware in `backend/src/app.js`) and the
  `vercel.json` configurations for both frontend and backend were adapted with the help of AI
  assistance to get Vercel's serverless deployment working correctly (this took several rounds
  of trial and error around CORS, MongoDB IP allowlisting, and SPA routing).
- All business logic — expense CRUD, filtering, validation rules, summary calculations, and the
  monthly report aggregation — was reviewed and is understood line-by-line.
