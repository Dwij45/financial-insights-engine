# FinLedger — Finance Dashboard API

A role-based financial management backend built with Node.js, Express, TypeScript, and MongoDB. Designed as a backend assessment submission demonstrating RBAC, MongoDB aggregation pipelines, soft delete, response caching, and full Swagger documentation.

> **Live API** → https://financial-insights-engine-1.onrender.com  
> **Swagger UI** → https://financial-insights-engine-1.onrender.com/api/docs/

---

## Prior Work

This project builds on domain knowledge from **[ExpenseSync](https://github.com/Dwij45/ExpenseSync)** — a full-stack expense tracker built with JavaScript and React. That project established the core domain understanding (transactions, categories, dashboard summaries), while FinLedger is a deliberate re-architecture into a multi-role, TypeScript-native backend with formal access control, audit compliance, and service-layer separation.

Key improvements over ExpenseSync:
- Fixed category enums (free-text in ExpenseSync caused aggregation inconsistencies)
- Soft delete instead of hard delete for audit trail
- Role-based access with middleware enforcement
- Typed DTOs and service/controller separation

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Language | TypeScript (strict mode) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jsonwebtoken) — 48h TTL |
| Caching | node-cache with TTL + pattern invalidation |
| Rate Limiting | express-rate-limit |
| API Docs | Swagger UI (swagger-ui-express) |

---

## Features

- **3-tier RBAC** — Viewer, Analyst, Admin enforced at middleware level
- **Financial records** — CRUD with fixed categories, date validation, sorting, filtering, pagination
- **Dashboard analytics** — MongoDB aggregation: summary, category totals, monthly/weekly trends
- **Soft delete** — records never permanently removed, full audit trail preserved
- **Caching** — dashboard responses cached with TTL and invalidated on writes
- **Rate limiting** — 10 req/15 min on auth, 100 req/15 min on API
- **Swagger UI** — fully interactive docs, testable without Postman

---

## Project Structure

```
zorvyn_finance_backend/
│
├── src/
│   ├── config/
│   │   ├── cache.ts
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── swagger.ts
│   │
│   ├── controller/
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── transaction.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── roleAccess.middleware.ts
│   │
│   ├── models/
│   │   ├── transaction.model.ts
│   │   └── user.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── dashboard.router.ts
│   │   └── transaction.routes.ts
│   │
│   ├── services/
│   │   ├── auth.services.ts
│   │   ├── dashboard.services.ts
│   │   └── transaction.services.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── transaction.types.ts
│   │
│   ├── utils/
│   │
│   ├── app.ts
│   └── server.ts
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md

---

## Local Setup

**Prerequisites:** Node.js v18+, npm v9+, MongoDB Atlas URI

```bash
git clone https://github.com/Dwij45/financial-insights-engine.git
cd financial-insights-engine
npm install
```

### Project Structure

- **config/** → Environment setup, DB connection, caching, Swagger docs  
- **controller/** → Handles request/response logic  
- **middleware/** → Auth, error handling, rate limiting, RBAC  
- **models/** → Mongoose schemas  
- **routes/** → API route definitions  
- **services/** → Business logic layer  
- **types/** → TypeScript types/interfaces  
- **utils/** → Helper functions  
- **app.ts** → Express app configuration  
- **server.ts** → Entry point  
Create `.env` in project root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/db_name
JWT_SECRET=your_secret_key_here
```

```bash

# Start development server
npm run dev
# → http://localhost:3000
# → http://localhost:3000/api/docs
```

---

## API Overview

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
```

### Transactions
```
GET    /api/transactions              filter · sort · paginate
GET    /api/transactions/:id
GET    /api/transactions/categories
POST   /api/transactions              admin only
PUT    /api/transactions/:id          admin only
PUT /api/transactions/:id          admin only (soft delete)
```

**Query params:** `type` · `category` · `startDate` · `endDate` · `sortBy` · `order` · `page` · `limit` · `search`

### Dashboard
```
GET    /api/dashboard/summary         all roles
GET    /api/dashboard/categories      analyst · admin
GET    /api/dashboard/recent          analyst · admin
GET    /api/dashboard/monthly         analyst · admin
GET    /api/dashboard/weekly          analyst · admin
```

### Users (admin only)
```
GET    /api/users
PATCH  /api/users/:id/status
PATCH  /api/users/:id/role
```

---

## Role Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View transactions | ✓ | ✓ | ✓ |
| View dashboard summary | ✓ | ✓ | ✓ |
| View category breakdown | — | ✓ | ✓ |
| View trends (monthly/weekly) | — | ✓ | ✓ |
| Create transaction | — | — | ✓ |
| Update transaction | — | — | ✓ |
| Soft delete transaction | — | — | ✓ |
| Manage users | — | — | ✓ |

---

## Key Design Decisions

**Soft delete over hard delete**  
Financial records are never permanently removed. DELETE sets `isDeleted: true` and records `deletedAt`. Every query explicitly filters `{ isDeleted: false }` — no Mongoose hook, impossible to accidentally bypass.

**Fixed category enums**  
Categories are fixed enums split by type (income/expense). Free-text categories caused aggregation inconsistencies in ExpenseSync — this design prevents that entirely.

**Permissions at route level**  
`roleAccess(['admin'])` is declared on the route itself, not inside controllers. The entire permission model is readable by scanning routes files.

**isActive checked on every request**  
Auth middleware fetches the user from DB to verify `isActive`. A deactivated user is blocked immediately, even with a valid unexpired token.

**Cache invalidation on writes**  
Dashboard cache keys are invalidated using `deleteCacheByPattern('dashboard:')` on every create, update, or soft delete. Cache hit/miss is visible via the `X-Cache` response header.

---

## Error Codes

| Code | Meaning |
|---|---|
| 400 | Validation error — missing fields, future date, wrong category for type, bad ObjectId |
| 401 | Unauthorized — no token, invalid token, expired, user not found |
| 403 | Forbidden — insufficient role or account deactivated |
| 404 | Not found — resource doesn't exist or is soft deleted |
| 409 | Conflict — email already registered |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Server error — stack trace in development mode only |

---

## Assumptions

- Roles are assigned at registration; only admins can change them
- A Viewer is a stakeholder with read-only access to company data — not a personal finance user
- All amounts are stored in a single currency (no conversion)
- Transaction dates represent when the financial event occurred — future dates are invalid
- Rate limits are lenient (100 req/15 min) to allow testing without hitting limits

---

## Scripts

```bash
npm run dev        # ts-node-dev with hot reload
npm run build      # compile to dist/
npm run start      # run compiled dist/server.js
npx ts-node scripts/seed.ts   # seed database
```