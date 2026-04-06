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
 
- **3-tier RBAC** — Viewer, Analyst, Admin. Permissions declared at route level via `roleAccess(['admin'])` factory middleware. Controllers contain zero access logic.
- **Financial records** — full CRUD with 19 fixed categories (split by income/expense type), date validation, sorting, filtering by type/category/date range, search on comment field, and cursor-based pagination capped at 50 per page
- **Dashboard analytics** — five MongoDB aggregation endpoints: total summary, category-wise totals, recent activity, monthly trends, weekly trends
- **Soft delete** — `isDeleted` flag + `deletedAt` timestamp on every delete. Records never permanently removed. Every query explicitly filters `{ isDeleted: false }` at the query level — no Mongoose hook, impossible to bypass accidentally
- **Response caching** — dashboard queries cached with 5–10 min TTL. Automatic invalidation via `deleteCacheByPattern('dashboard:')` on any write. `X-Cache: HIT/MISS` header visible in Swagger and Postman
- **Rate limiting** — 10 req/15 min on auth routes (brute force protection), 100 req/15 min on all API routes
- **isActive enforcement** — auth middleware fetches user from DB on every request and checks `isActive`. A deactivated user is rejected immediately even with a valid unexpired token
- **Swagger UI** — all 15+ endpoints documented with request bodies, query params, and example responses. Fully interactive against the live server without needing Postman
 
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
DELETE /api/transactions/:id       admin only (soft delete)
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
 
**Permissions enforced at the route layer, not in controllers**  
`roleAccess(['admin'])` is declared directly on each route definition. The entire permission model is auditable by reading routes files alone — no role checks are buried inside controller or service code. This also means controllers stay focused on a single responsibility: read request, call service, send response.
 
**Soft delete with explicit query filters**  
Every delete operation sets `isDeleted: true` and records `deletedAt`. There is no Mongoose pre-hook — instead, every `find`, `findOne`, `aggregate`, and `countDocuments` call includes `{ isDeleted: false }` explicitly. This is more verbose but impossible to accidentally bypass, which matters for financial data. A soft-deleted record accessed by ID returns a clean 404 — the same response as a record that never existed.
 
**Fixed category enums split by type**  
Categories are validated against their transaction type at the service layer — you cannot assign an expense category to an income transaction. This was directly motivated by ExpenseSync where free-text categories produced unreliable dashboard aggregations. The `GET /transactions/categories` endpoint returns all valid values so a frontend never needs to hardcode them.
 
**isActive verified on every authenticated request**  
Auth middleware fetches the user from MongoDB on every request to check `isActive`. This means deactivating an account takes effect on the next request — the user does not need to wait for their JWT to expire. The trade-off is one additional DB read per request, which is acceptable for a financial system where access revocation needs to be immediate.
 
**JWT carries role in payload**  
The token payload includes `{ id, role }` so roleAccess never needs a DB call — it reads directly from `req.user.role` set by auth middleware. The trade-off is that a role change is not reflected until the current token expires (48h TTL). This is a conscious choice: the simplicity and performance benefit outweighs the delay for this use case.
 
**node-cache over Redis**  
node-cache provides zero-setup in-process caching with an interface identical to a Redis client. For a single-instance deployment it is equivalent. The cache utility (`utils/cache.ts`) wraps it behind `getCache`, `setCache`, and `deleteCacheByPattern` functions — swapping to Redis in production requires only changing the implementation of those three functions.
 
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