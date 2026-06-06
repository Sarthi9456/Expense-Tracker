# Expense Tracker

A full-stack expense tracking application built with **React** (frontend) and **Node.js / Express / MongoDB** (backend).

## Features

- ✅ User Authentication (JWT — register & login)
- ✅ Add / Edit / Delete Expenses
- ✅ Expense History with filters
- ✅ Monthly Reports with Pie Chart
- ✅ Export Reports as CSV

---

## Project Structure

```
Expense-Tracker/
├── backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/connectMongo.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/         # React + Vite + MUI
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
└── vercel.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sarthi9456/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

> **MongoDB Atlas (cloud):** Replace `MONGODB_URI` with your Atlas connection string.

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create your `.env` file:

```bash
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

The app will be running at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint                        | Auth | Description                |
|--------|---------------------------------|------|----------------------------|
| POST   | /api/auth/register              | No   | Register new user          |
| POST   | /api/auth/login                 | No   | Login, returns JWT         |
| GET    | /api/expenses                   | Yes  | List all expenses          |
| POST   | /api/expenses                   | Yes  | Create an expense          |
| PUT    | /api/expenses/:id               | Yes  | Update an expense          |
| DELETE | /api/expenses/:id               | Yes  | Delete an expense          |
| GET    | /api/reports/monthly?year=&month= | Yes | Monthly summary + chart data |
| GET    | /api/reports/export/csv?year=&month= | Yes | Download CSV export    |

---

## Deployment

### Vercel (recommended for frontend + backend together)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Set the following **Environment Variables** in Vercel project settings:
   - `MONGODB_URI` — your MongoDB Atlas URI
   - `JWT_SECRET` — a long random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CORS_ORIGIN` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
   - `VITE_API_URL` — your Vercel backend URL
4. Deploy!

### Manual (separate hosting)

- Deploy backend to [Railway](https://railway.app), [Render](https://render.com), or any Node.js host.
- Deploy frontend to Vercel or Netlify using `npm run build` (`dist/` folder).
- Set environment variables on each platform accordingly.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, MUI v5, Chart.js    |
| Backend   | Node.js, Express, Mongoose          |
| Database  | MongoDB                             |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| Validation| Zod                                 |
