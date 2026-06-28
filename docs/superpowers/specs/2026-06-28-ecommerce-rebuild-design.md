# E-Commerce Rebuild Design Spec

**Date:** 2026-06-28
**Status:** Approved
**Author:** Bijaya Kingring

## 1. Purpose

Rebuild the existing MERN (MongoDB) e-commerce project ("Aurora Shop") into a new, reusable, fast MySQL-based project. The current project suffers from poor reusability — duplicated queries, scattered validation, and page files that mix UI, fetching, state, and validation. This rebuild keeps all existing features but reorganizes them into a clean layered architecture using raw SQL with a Repository pattern.

## 2. Goals

- **Reusable** — shared components, hooks, services, and repositories. No duplicated logic.
- **Fast** — client-side caching (TanStack Query), connection pooling, pagination.
- **Type-safe** — TypeScript on both client and server with typed SQL rows.
- **Raw SQL** — no ORM. Source of truth is `.sql` files; server uses mysql2 pooling.
- **All existing features preserved.**

## 3. Non-Goals (Deferred)

- Visual design / styling polish — redesign happens in a later pass.
- New features beyond current scope — added when needed.
- Migration of existing MongoDB data — fresh start.

## 4. High-Level Structure

A new top-level folder `N/` with three siblings:

```
N/
├── client/      # React + Vite + TS frontend (reorganized for reusability)
├── server/      # Node + Express + TS backend
└── database/    # Pure SQL: schema files + seed data + migrations
```

- `database/` holds pure `.sql` files — source of truth, hand-written.
- `server/` reads schema for reference but executes SQL via mysql2 pool.
- A single init command rebuilds schema + seed data.

## 5. Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| DB access | Raw SQL + mysql2 pool + Repository pattern | Max control, no ORM, learning-friendly, reusable |
| Server language | TypeScript | Type safety, matches frontend, enforces clean layers |
| Frontend stack | React + Vite + Tailwind + Antd | Keep known stack, fix structure not libraries |
| Server data (client side) | TanStack Query + pagination | Caching, background refetch, instant pages |
| Client state | Zustand | Replaces Context, simpler, selective re-renders |
| Forms | react-hook-form + Zod | Reuse existing patterns, type-safe schemas |
| Realtime | Socket.io | Chat + notifications (preserved) |
| Payments | Khalti | Preserved |
| Files/Email | Cloudinary + Nodemailer | Preserved |

## 6. Database Schema (Raw SQL → MySQL 8)

### 6.1 Auth & Users
```
users              id (PK, BIGINT, AUTO_INCREMENT), name VARCHAR, email VARCHAR UNIQUE,
                   password_hash VARCHAR, role ENUM('admin','seller','customer') DEFAULT 'customer',
                   phone VARCHAR, avatar_url VARCHAR, is_verified BOOLEAN DEFAULT FALSE,
                   is_banned BOOLEAN DEFAULT FALSE, created_at, updated_at TIMESTAMP
sessions           id PK, user_id FK→users, refresh_token_hash, ip, user_agent,
                   expires_at, revoked_at (nullable)
```

### 6.2 Seller & Profile
```
seller_profiles   id PK, user_id FK→users, company_name, gst_number, bio, address,
                  rating DECIMAL(2,1) DEFAULT 0, total_reviews INT DEFAULT 0,
                  status ENUM('pending','approved','rejected') DEFAULT 'pending'
user_addresses    id PK, user_id FK→users, label, full_name, phone, line1, line2,
                  city, state, postal_code, country, is_default BOOLEAN
```

### 6.3 Catalog
```
categories        id PK, name, slug UNIQUE, description, image_url,
                  parent_id FK→categories (nullable), is_active BOOLEAN
products          id PK, seller_id FK→users, category_id FK→categories, name, slug UNIQUE,
                  description TEXT, price DECIMAL(10,2), discount_price DECIMAL(10,2),
                  stock INT, sku, is_active BOOLEAN, created_at, updated_at
product_images    id PK, product_id FK→products, public_id, url, is_primary BOOLEAN, position INT
product_reviews   id PK, product_id FK→products, user_id FK→users, rating TINYINT (1-5),
                  title, comment TEXT, is_approved BOOLEAN
favourites        id PK, user_id FK→users, product_id FK→products  UNIQUE(user_id, product_id)
```

### 6.4 Cart & Orders
```
cart              id PK, user_id FK→users, coupon_id FK→coupons (nullable), is_active BOOLEAN,
                  created_at, updated_at
cart_items        id PK, cart_id FK→cart, product_id FK→products, quantity INT, unit_price DECIMAL(10,2)
orders            id PK, order_number UNIQUE, user_id FK→users, cart_id FK→cart,
                  subtotal DECIMAL(10,2), discount DECIMAL(10,2), shipping DECIMAL(10,2),
                  total DECIMAL(10,2),
                  status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
                  payment_status ENUM('unpaid','paid','refunded','failed') DEFAULT 'unpaid',
                  created_at
order_items       id PK, order_id FK→orders, product_id FK→products, quantity INT,
                  unit_price DECIMAL(10,2), line_total DECIMAL(10,2)
order_addresses   id PK, order_id FK→orders, full_name, phone, line1, line2, city, state,
                  postal_code, country   -- snapshot of address at order time
```

### 6.5 Payments & Coupons
```
transactions      id PK, order_id FK→orders, pidx, transaction_id, tidx, amount,
                  total_amount, mobile, status, purchase_order_name, created_at
coupons           id PK, code UNIQUE, type ENUM('percent','fixed'), value DECIMAL,
                  min_order DECIMAL, max_uses INT, used_count INT DEFAULT 0,
                  valid_from DATETIME, valid_until DATETIME, is_active BOOLEAN
```

### 6.6 Content & Notifications
```
banners           id PK, title, image_url, link_url, position, is_active BOOLEAN,
                  sort_order INT, start_at DATETIME, end_at DATETIME
notifications     id PK, user_id FK→users, type, title, message, data JSON, is_read BOOLEAN, created_at
```

### 6.7 Chat (Socket.io)
```
conversations     id PK, customer_id FK→users, seller_id FK→users, product_id FK→products (nullable),
                  last_message_at, created_at
messages          id PK, conversation_id FK→conversations, sender_id FK→users,
                  content TEXT, is_read BOOLEAN, created_at
```

### 6.8 Schema Notes
- **Cart bug fix:** current MongoDB `cart.items` is a single object, not an array. New design uses a proper `cart_items` child table.
- **Order address snapshot:** `order_addresses` freezes address at order time so changing a user's address doesn't alter past orders.
- **All passwords** stored as bcrypt hashes in `password_hash`, never plaintext.
- **Soft deletes** not used in v1; rely on status/is_active flags where relevant.

## 7. Server Architecture (Repository Pattern)

```
server/src/
├── config/           # env, db pool, cloudinary, mailer, jwt keys
├── db/
│   └── pool.ts       # single mysql2 connection pool (shared everywhere)
├── repositories/     # ⭐ ALL SQL lives here, one file per table
│   ├── user.repository.ts
│   ├── product.repository.ts
│   ├── order.repository.ts
│   └── ... (one per table)
├── services/         # business logic, calls repositories, no SQL
│   ├── auth.service.ts
│   ├── cart.service.ts
│   └── ...
├── controllers/      # HTTP layer, calls services, returns JSON
├── routes/           # express routers, role-based middleware
├── middleware/       # auth, validation, upload, error-handler
├── validators/       # zod schemas, one per domain
├── sockets/          # socket.io handlers (chat, notifications)
├── types/            # shared TS types (User, Product, Order...)
├── utils/            # helpers (hashToken, sendEmail, errors)
└── app.ts            # express app bootstrap
```

### 7.1 Layer Rules

| Layer | Allowed to do | NOT allowed |
|-------|---------------|-------------|
| Controller | Parse req, call service, send res | ❌ SQL, ❌ business logic |
| Service | Business logic, orchestrate repos | ❌ SQL, ❌ HTTP (req/res) |
| Repository | ALL raw SQL for one table | ❌ business logic, ❌ HTTP |

### 7.2 Example Flow — "customer adds to cart"
```
POST /cart/items
  → cart.controller.ts     (validates req.body, calls service)
    → cart.service.ts      (checks stock, calc price, calls repos)
      → cart.repository.ts        (SELECT/INSERT on cart table)
      → cartItem.repository.ts    (INSERT on cart_items table)
```

### 7.3 Conventions
- **Shared `pool.ts`** — one mysql2 pool, every repo imports it. No connection leaks.
- **Shared error classes** (`AppError`, `NotFoundError`) + global error middleware → consistent `{success, message, data}` JSON responses.
- **Typed rows** — each repo defines a TS type for its row, services get autocomplete on query results.
- **Zod validators** replace scattered Joi/yup validation, one schema per endpoint.

## 8. Client Architecture (Reusable Component System)

```
client/src/
├── components/        # ⭐ Reusable UI primitives (LEGO bricks)
│   ├── ui/            # Button, Input, Select, Modal, Card, Spinner, Badge
│   ├── form/          # FormField, FormInput, FormSelect (wraps react-hook-form)
│   ├── table/         # DataTable (config-driven, pagination built-in)
│   └── layout/        # Header, Sidebar, AdminLayout, CustomerLayout, SellerLayout
├── features/          # Page modules (one folder per domain)
│   ├── auth/          # LoginPage, RegisterPage, + auth slice
│   ├── product/       # ProductViewPage, ProductCard
│   ├── cart/          # CartPage
│   ├── checkout/      # CheckoutPage
│   └── admin/         # Admin pages grouped
├── hooks/             # ⭐ Reusable React Query hooks (data layer)
│   ├── useProducts.ts     # useProducts(), useProduct(), useCreateProduct()
│   ├── useCart.ts
│   └── ...
├── services/          # Thin axios wrappers (api calls only, no logic)
│   └── api/
│       ├── client.ts      # configured axios instance + interceptors
│       ├── auth.api.ts
│       ├── product.api.ts
│       └── ...
├── stores/            # Client state: auth user, cart count, theme
│   ├── authStore.ts       # zustand store (replaces AppContext)
│   └── cartStore.ts
├── types/             # TS types mirroring backend
├── lib/               # utils (formatCurrency, formatDate, cn)
├── routes/            # Router config + route guards (RoleGuard)
├── App.tsx
└── main.tsx
```

### 8.1 Reusable Layers
1. **`components/ui/`** — generic primitives (`<Button variant="primary">`) used everywhere; replaces bespoke per-page buttons/inputs.
2. **`hooks/`** — React Query hooks. `useProducts()` gives caching, loading, error states for free. No duplicated `useEffect + axios` blocks.
3. **`services/api/`** — thin axios wrappers. `productApi.getById(id)` is the ONLY place that knows the product URL.
4. **`stores/`** — Zustand for client state (auth, cart count, UI state). Replaces React Context, avoids re-render storms.
5. **`features/`** — page logic grouped by domain, importing from the layers above.

### 8.2 Reusability Example
"Show a product card" currently rewritten on home, search, cart, seller page, admin. New way: `<ProductCard product={p} />` everywhere.

## 9. Request Flow (End-to-End)

```
[Browser] React component
  → hooks/useProducts.ts (React Query cache)
    → services/api/product.api.ts (axios)
      ──HTTP──▶ [Express server]
        → routes/product.routes.ts (auth middleware)
          → controllers/product.controller.ts
            → services/product.service.ts
              → repositories/product.repository.ts
                → db/pool.ts (mysql2)
                  ──SQL──▶ [MySQL]
```

## 10. Dev Workflow

```
1. cd N/database && mysql < 00-schema.sql     # create all tables
                        && mysql < seed.sql    # optional seed data
2. cd N/server  && npm install && npm run dev  # :5000 + socket.io
3. cd N/client  && npm install && npm run dev  # :5173
```

### 10.1 Environment Files
- `N/server/.env` — `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `KHALTI_KEY`, `CLOUDINARY_*`, `SMTP_*`
- `N/client/.env` — `VITE_API_URL=http://localhost:5000/api`

## 11. Auth Model

- JWT access token (short-lived) for API auth.
- Refresh token (long-lived) stored hashed in `sessions` table; rotated on use.
- Roles enforced by middleware: `requireRole('admin')`, `requireRole('seller')`, `requireRole('customer')`.
- Route-level guards on frontend via `<RoleGuard>`.

## 12. Preserved Feature Checklist

- [x] Auth: register, login, email activation, forgot/reset password
- [x] Roles: admin, seller, customer
- [x] Admin: dashboard, categories CRUD, banners CRUD, coupons CRUD, products, users (view/ban)
- [x] Seller: become-a-seller, dashboard, products CRUD, categories view
- [x] Customer: cart, checkout, order history
- [x] Public: home, product view, search, "more products", reviews
- [x] Realtime: Socket.io chat (customer ↔ seller), notifications
- [x] Payments: Khalti
- [x] Services: Cloudinary (images), Nodemailer (email)

## 13. Out of Scope / Future

- New visual design (separate pass after structure is solid).
- Additional features beyond current scope.
- Production hardening (rate limiting tuning, observability, CI/CD).
