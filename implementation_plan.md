# AgroConnect Backend — Architecture & Structure Plan

> **Status:** Architecture-only. No implementation code. All decisions are grounded in `/docs`.

---

## 1. Complete Folder Structure

```
Agroconnect-Backend/
├── docs/                          # Project documentation (already exists)
├── logs/                          # Winston log output (git-ignored)
│   ├── combined.log
│   └── error.log
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts                     # Express app factory
│   ├── server.ts                  # HTTP + Socket.io bootstrap
│   │
│   ├── config/                    # All config in one place
│   │   ├── index.ts               # Re-exports everything
│   │   ├── env.ts                 # Zod-parsed & typed env vars
│   │   ├── cloudinary.ts
│   │   ├── redis.ts
│   │   ├── bullmq.ts
│   │   └── socket.ts
│   │
│   ├── lib/                       # Third-party client singletons
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── redis.ts               # ioredis singleton
│   │   ├── cloudinary.ts          # Cloudinary SDK init
│   │   └── better-auth.ts         # better-auth instance
│   │
│   ├── modules/                   # Feature modules (18 total)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── seller/
│   │   ├── category/
│   │   ├── product/
│   │   ├── shop/
│   │   ├── order/
│   │   ├── payment/
│   │   ├── credit/
│   │   ├── subscription/
│   │   ├── connection/
│   │   ├── review/
│   │   ├── ai/
│   │   ├── upload/
│   │   ├── notification/
│   │   ├── blog/
│   │   ├── newsletter/
│   │   └── admin/
│   │
│   ├── queues/                    # BullMQ queues & workers
│   │   ├── index.ts               # Queue registry / exports
│   │   ├── email/
│   │   │   ├── email.queue.ts
│   │   │   ├── email.worker.ts
│   │   │   └── email.processor.ts
│   │   └── subscription/
│   │       ├── subscription.queue.ts
│   │       ├── subscription.worker.ts
│   │       └── subscription.processor.ts
│   │
│   ├── socket/                    # Socket.io namespaces & handlers
│   │   ├── index.ts               # Socket server factory
│   │   ├── socket.middleware.ts   # Auth middleware for sockets
│   │   └── handlers/
│   │       └── notification.handler.ts
│   │
│   ├── middleware/                # Express middleware
│   │   ├── asyncHandler.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── validate.ts
│   │   ├── rateLimiter.ts
│   │   ├── upload.ts              # multer config
│   │   └── language.ts            # Accept-Language header parser
│   │
│   ├── errors/                    # Custom error classes
│   │   ├── AppError.ts
│   │   └── errorCodes.ts          # All error code constants
│   │
│   ├── utils/                     # Pure utility functions
│   │   ├── logger.ts              # Winston instance
│   │   ├── apiResponse.ts         # sendSuccess / sendPaginated helpers
│   │   ├── cacheKeys.ts           # Cache key factory functions
│   │   ├── paginate.ts            # Pagination helper
│   │   └── hashParams.ts          # Query param hashing for cache keys
│   │
│   ├── types/                     # Global TypeScript types
│   │   ├── express.d.ts           # Augmented Request (user, lang)
│   │   └── index.ts               # Shared types (PaginatedResult, etc.)
│   │
│   └── routes/
│       └── index.ts               # Root router: mounts all modules at /api/v1
│
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
└── package.json
```

---

## 2. Module Structure (Each Module)

Every module follows the **exact same file shape** mandated in `backend-architecture.md`.

### Template

```
modules/<name>/
├── <name>.controller.ts     # req/res only, calls service, ≤20 lines/handler
├── <name>.service.ts        # ALL business logic, Prisma, Redis, BullMQ calls
├── <name>.routes.ts         # Route definitions + middleware chain
├── <name>.validation.ts     # Zod schemas for all input shapes
└── <name>.queries.ts        # (optional) complex/reusable Prisma queries
```

### Per-Module Breakdown

| Module | queries.ts? | Key Responsibilities |
|---|---|---|
| `auth` | No | better-auth integration, session management, login/register/logout |
| `user` | No | Profile CRUD, role management, soft-delete |
| `seller` | Yes | Verification workflow, plan checking, document upload trigger |
| `category` | No | CRUD, cache invalidation on create/update |
| `product` | Yes | Listing CRUD, feed query (plan-sorted), soft-delete |
| `shop` | Yes | Shop feed, wholesale directory, shop profile |
| `order` | Yes | Order creation (Prisma transaction), status transitions |
| `payment` | No | SSLCommerz initiation, IPN webhook handling |
| `credit` | No | Credit balance check, deduction (transaction), pack purchase |
| `subscription` | No | Plan activation, status transitions, expiry |
| `connection` | Yes | Connection request (credit deduction + connection creation in 1 tx) |
| `review` | No | Review CRUD, ReviewType discrimination |
| `ai` | No | Crop Doctor, Price Advisor, Crop Recommender, Yield Report |
| `upload` | No | Cloudinary upload, MIME validation, response URL |
| `notification` | Yes | Notification creation, mark-read, Socket.io emit |
| `blog` | No | Blog post CRUD |
| `newsletter` | No | Subscribe/unsubscribe, email queue dispatch |
| `admin` | Yes | User/seller management, verification approvals, dashboard stats |

---

## 3. Config Structure

### `src/config/env.ts`
- Parses **all** env vars using **Zod** at startup
- Throws immediately if any required var is missing (fail-fast)
- Exports a single typed `env` object used everywhere
- Groups: `app`, `database`, `redis`, `cloudinary`, `sslcommerz`, `ai`, `email`, `auth`

### `src/config/cloudinary.ts`
- Exports Cloudinary configuration options (folder structure, upload presets)
- Does NOT initialize the SDK here — that's `lib/cloudinary.ts`

### `src/config/redis.ts`
- Redis connection options (host, port, password, TLS, retry strategy)
- TTL constants: `PRODUCT_FEED_TTL = 300`, `CATEGORY_TTL = 3600`, etc.

### `src/config/bullmq.ts`
- BullMQ connection config (reuses Redis options)
- Default job options: `attempts: 3`, `backoff: { type: 'exponential', delay: 5000 }`

### `src/config/socket.ts`
- Socket.io server options (cors origins, transports, ping timeout)

---

## 4. Middleware Structure

```
middleware/
├── asyncHandler.ts        # Wraps async route handlers, passes errors to next()
├── globalErrorHandler.ts  # Centralized Express error handler (last middleware)
├── authenticate.ts        # Verifies better-auth session/JWT, attaches req.user
├── authorize.ts           # Role guard factory: authorize('ADMIN', 'SELLER')
├── validate.ts            # Zod validation factory: validate(schema, 'body'|'query'|'params')
├── rateLimiter.ts         # express-rate-limit: default + strict AI limiter
├── upload.ts              # multer + MIME type check (not just extension)
└── language.ts            # Parses Accept-Language header → req.lang ('en'|'bn')
```

### Middleware Chain Order (in `app.ts`)

```
helmet()
cors()
express.json()
express.urlencoded()
language()          ← parse Accept-Language early
morgan/requestLogger
/api/v1 routes
404 handler
globalErrorHandler  ← LAST
```

### Per-Route Chain Example (product routes)

```
rateLimiter.default
→ authenticate
→ authorize('SELLER')
→ validate(createProductSchema)
→ productController.create
```

---

## 5. Error Handling Structure

### `src/errors/AppError.ts`

```typescript
// Shape only — no implementation
class AppError extends Error {
  statusCode: number      // HTTP status
  errorCode: string       // From errorCodes.ts (e.g. INSUFFICIENT_CREDITS)
  isOperational: boolean  // true = expected, false = crash
}
```

### `src/errors/errorCodes.ts`

All error codes from `api-conventions.md` as a const object:
```
AUTH_REQUIRED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR,
INSUFFICIENT_CREDITS, NOT_VERIFIED, SUBSCRIPTION_REQUIRED,
ALREADY_CONNECTED, PLAN_LIMIT_REACHED, PAYMENT_FAILED, INTERNAL_ERROR
```

### `src/middleware/globalErrorHandler.ts` — Decision Logic

```
Is AppError (isOperational)?
  → format error response: { success: false, message, errorCode }
  → statusCode from AppError

Is ZodError?
  → 400, errorCode: VALIDATION_ERROR, extract field errors

Is Prisma Known Request Error (P2002, P2025)?
  → map to 409 (conflict) or 404

Everything else?
  → 500, errorCode: INTERNAL_ERROR
  → DO NOT expose message/stack in production (NODE_ENV check)
  → Log full error with Winston

Never expose stack trace in production.
```

---

## 6. Winston Logging Setup

### `src/utils/logger.ts`

**Three transports:**

| Transport | When | Format |
|---|---|---|
| `Console` | `NODE_ENV !== 'production'` | Colorized, human-readable |
| `File: logs/combined.log` | Always | JSON, all levels |
| `File: logs/error.log` | Always | JSON, `level: 'error'` only |

**Log levels used:**
- `error` — unhandled errors, failed jobs, payment failures
- `warn` — deprecated usage, Redis down (non-crash)
- `info` — server start, queue start, successful payments
- `http` — every request (method, url, status, duration)
- `debug` — AI call metadata (NOT response content per AI rules)

**Key rules from `backend-rules.md`:**
- Never log passwords, tokens, or payment data
- Log all AI calls (metadata only, not AI response content)
- Log failed BullMQ jobs

---

## 7. Redis Connection Architecture

### `src/lib/redis.ts` — Singleton

```
Single ioredis instance shared across the entire application.
- Connection options from config/redis.ts
- Lazy connect (connects on first use)
- Error event listener → Winston warn (never crash the app)
- Retry strategy: exponential backoff, max 10 retries
```

### Cache Key Convention (from `backend-rules.md`)

Format: `module:identifier:params_hash`

Examples defined in `src/utils/cacheKeys.ts`:
```
product:feed:{hash(filters+page+limit)}        TTL: 300s
shop:feed:{hash(filters+page+limit)}           TTL: 300s
product:single:{productId}                     TTL: 600s
shop:single:{shopId}                           TTL: 600s
category:all                                   TTL: 3600s
ai:recommendation:{userId}:{hash(input)}       TTL: 900s
```

### Cache Invalidation Strategy

| Event | Invalidated Keys |
|---|---|
| Product created/updated/deleted | `product:feed:*`, `product:single:{id}` |
| Shop updated | `shop:feed:*`, `shop:single:{id}` |
| Category created/updated | `category:all` |
| Seller plan changed | `product:feed:*`, `shop:feed:*` |

**Rule:** All Redis calls are wrapped in `try/catch`. Redis failure = log warn, serve DB response. Never crash.

---

## 8. BullMQ Queue Architecture

### `src/queues/` Structure

```
queues/
├── index.ts                         # Exports all queues + startAllWorkers()
├── email/
│   ├── email.queue.ts               # Queue instance + addJob helpers
│   ├── email.worker.ts              # Worker instance + concurrency
│   └── email.processor.ts           # Job type routing logic
└── subscription/
    ├── subscription.queue.ts
    ├── subscription.worker.ts
    └── subscription.processor.ts
```

### Queue: `email-queue`

**Job types dispatched into this queue:**

| Job Name | Trigger | Data Shape |
|---|---|---|
| `order-confirmation` | Order placed | `{ orderId, userEmail, lang }` |
| `order-status-update` | Order status changes | `{ orderId, status, userEmail, lang }` |
| `connection-alert` | Connection request received | `{ shopId, buyerName, lang }` |
| `subscription-reminder` | 3 days before expiry | `{ sellerId, planName, expiresAt }` |
| `newsletter-broadcast` | Admin sends newsletter | `{ subject, html, recipientList[] }` |

**Worker config:** `concurrency: 5`, `attempts: 3`, exponential backoff

### Queue: `subscription-queue`

**Job types:**

| Job Name | Trigger | Data Shape |
|---|---|---|
| `check-expiry` | Scheduled (cron) | `{}` |
| `auto-renew` | Subscription nearing expiry | `{ subscriptionId, sellerId }` |
| `downgrade-to-free` | Expiry confirmed, no renewal | `{ sellerId }` |

**Worker config:** `concurrency: 2`, `attempts: 3`

### BullMQ Rules (from `backend-rules.md`)
- Controllers add jobs and **immediately return** — never await job
- Failed jobs are logged with Winston at `error` level
- Processors always handle errors gracefully

---

## 9. Socket.io Architecture

### `src/socket/index.ts` — Server Factory

```
Receives the http.Server instance.
Creates io = new Server(httpServer, optionsFromConfig).
Attaches socket auth middleware.
Registers notification namespace.
Exports: io instance + emitToUser(userId, event, data) helper
```

### `src/socket/socket.middleware.ts`

- Extracts session token from `socket.handshake.auth.token`
- Validates via better-auth session lookup
- Attaches `socket.data.user` (userId, role)
- Rejects unauthenticated connections

### `src/socket/handlers/notification.handler.ts`

```
On connection:
  → socket.join(`user:${socket.data.user.id}`)   ← personal room per user

Events emitted TO client (server → client):
  notification:new      → new notification object
  notification:read     → { notificationId }
  order:status-updated  → { orderId, status }
  connection:received   → { from, shopId }

Events received FROM client:
  notification:mark-read → { notificationId }
```

### Emit Helper: `emitToUser(userId, event, data)`

Used inside service layer (e.g. `notification.service.ts`, `order.service.ts`) to push real-time events. Services import this helper — they never import `io` directly.

---

## 10. Environment Variable Structure (`.env.example`)

```dotenv
# ─── App ──────────────────────────────────────────
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# ─── Database ─────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/agroconnect

# ─── Better Auth ──────────────────────────────────
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:5000

# ─── Redis ────────────────────────────────────────
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# ─── Cloudinary ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ─── SSLCommerz ───────────────────────────────────
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false

# ─── AI ───────────────────────────────────────────
GEMINI_API_KEY=
GROQ_API_KEY=

# ─── Email (SMTP) ─────────────────────────────────
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@agroconnect.com

# ─── Rate Limiting ────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_PER_USER_PER_DAY=10

# ─── Logging ──────────────────────────────────────
LOG_LEVEL=info
```

---

## 11. Key Architectural Decisions Explained

### Why feature-based modules, not layer-based (controllers/, services/)?
Per `backend-architecture.md`. Feature modules are self-contained. You can add, remove, or hand off a module (e.g. `blog`) without touching unrelated code. Layer-based folders create cross-cutting dependencies that break at scale.

### Why `lib/` vs `config/`?
`config/` = **options and constants** (what to use, how to connect).  
`lib/` = **singleton instances** (the actual live connection object).  
This separation means tests can swap `lib/redis.ts` without touching config parsing.

### Why Zod for env parsing in `config/env.ts`?
Fail-fast at startup if `DATABASE_URL` or `BETTER_AUTH_SECRET` is missing. Gets full TypeScript inference on `env.database.url` instead of `process.env.DATABASE_URL as string` everywhere.

### Why `asyncHandler` wrapper?
Mandated by `backend-rules.md`. All async controllers use it so thrown `AppError` instances are automatically forwarded to `globalErrorHandler` without try/catch boilerplate in every handler.

### Why `emitToUser()` helper instead of importing `io`?
Keeps services decoupled from the socket layer. Services only call a stable helper signature. The socket transport can be swapped without touching service code.

### Why `queries.ts` is optional per module?
`backend-architecture.md` marks it optional. Simple modules (category, user) only need one or two Prisma calls directly in the service. Complex modules (order, connection, product feed) warrant a `queries.ts` to keep service files readable.

### Why two BullMQ queues (not one)?
`email-queue` and `subscription-queue` have different concurrency, retry, and scheduling needs. Subscription jobs are cron-like and low-frequency. Email jobs are high-frequency and user-facing. Mixing them causes priority starvation.

### Why personal rooms (`user:{id}`) in Socket.io?
Allows `emitToUser(userId, ...)` without maintaining a manual `Map<userId, socketId>`. `io.to('user:${userId}').emit(...)` works even if the user has multiple tabs open.

### Why soft-delete on only 5 tables?
Only `User`, `Product`, `Shop`, `Order`, `Review` require audit trails or recovery per `database-rules.md`. Lookup tables (Category, CreditPack) are hard-deleted — no need for tombstone complexity.

### Why cache key hashing (`hashParams`)?
Feed queries have variable filter combinations (`?category=rice&location=dhaka&page=2`). Hashing the entire query param set into a short key prevents unbounded key proliferation and matches the `module:identifier:params_hash` format required in `backend-rules.md`.

### Why MIME type check in `upload.ts` middleware (not just extension)?
Mandated by `backend-rules.md`: "Sanitize file uploads (check MIME type, not just extension)." A renamed `.exe` as `.jpg` bypasses extension checks. `file-type` or `mmmagic` libraries inspect actual file bytes.

### Why `language.ts` middleware runs early in the chain?
All AI routes need `Accept-Language` to inject the correct system prompt language context (required by `backend-rules.md`: "Always include language context in system prompt"). Running it once globally attaches `req.lang` before any route handler.

### Why `RATE_LIMIT_PER_USER_PER_DAY` for AI routes?
`backend-rules.md` mandates per-user daily AI rate limits (tied to plan: Free = 0 AI, Starter = Crop Doctor only, Pro = full AI). The global `rateLimiter.ts` handles IP-based limiting; AI routes get an additional Redis-counter-based per-user-per-day limiter checked inside the AI service.
