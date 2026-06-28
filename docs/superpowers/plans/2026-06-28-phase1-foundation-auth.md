# Phase 1: Foundation + Auth Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `N/` monorepo (client + server + database folders), write the complete MySQL schema, build the server and client core infrastructure, and implement Auth (register/login/me/logout) end-to-end across every layer to prove the architecture works.

**Architecture:** Raw SQL via mysql2 pooled connection + Repository pattern on the server (controller → service → repository, strict layer rules). React + Vite + TS client with TanStack Query (server state), Zustand (client state), reusable `components/ui` primitives, thin axios services, and React Query hooks. Every layer is typed and independently reusable.

**Tech Stack:** Node 22, Express 5, TypeScript, mysql2, Zod, bcryptjs, jsonwebtoken, Socket.io, React 18, Vite, TanStack Query, Zustand, react-hook-form, Tailwind CSS 4, Ant Design 5.

---

## File Structure

### `N/database/` — pure SQL (source of truth)
- `00-schema.sql` — full MySQL 8 schema, all tables (auth, catalog, cart/orders, payments, coupons, content, chat)
- `seed.sql` — admin user + sample categories/products for testing
- `drop.sql` — convenience: drops all tables for fast reset

### `N/server/` — Express + TS, Repository pattern
- `package.json`, `tsconfig.json`, `.env.example`, `nodemon.json`
- `src/config/env.ts` — typed env loader
- `src/config/db.ts` — mysql2 pool config
- `src/db/pool.ts` — shared pool instance + `query()` helper
- `src/types/index.ts` — shared types (User, Session, ApiSuccess, ApiError, UserRole)
- `src/utils/errors.ts` — `AppError`, `NotFoundError`, error handler
- `src/utils/response.ts` — `sendSuccess()`, `sendError()` helpers
- `src/utils/password.ts` — bcrypt hash/compare wrappers
- `src/utils/token.ts` — JWT sign/verify wrappers
- `src/middleware/error.middleware.ts` — global error handler
- `src/middleware/notFound.middleware.ts` — 404 handler
- `src/middleware/auth.middleware.ts` — `authenticate`, `requireRole`
- `src/middleware/validate.middleware.ts` — Zod validation
- `src/repositories/user.repository.ts` — ALL user SQL
- `src/repositories/session.repository.ts` — ALL session SQL
- `src/validators/auth.validator.ts` — Zod schemas for auth endpoints
- `src/services/auth.service.ts` — auth business logic
- `src/controllers/auth.controller.ts` — HTTP layer
- `src/routes/auth.routes.ts` — router
- `src/app.ts` — express app
- `src/index.ts` — bootstrap (DB connect, server start)

### `N/client/` — React + Vite + TS
- `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.env.example`
- `src/types/index.ts` — shared client types (User, etc.)
- `src/lib/utils.ts` — `cn()` className helper
- `src/lib/format.ts` — `formatCurrency`, `formatDate`
- `src/services/api/client.ts` — axios instance + interceptors
- `src/services/api/auth.api.ts` — auth API calls
- `src/stores/authStore.ts` — Zustand auth store
- `src/hooks/useAuth.ts` — React Query hooks for auth
- `src/components/ui/Button.tsx` — reusable button
- `src/components/ui/Input.tsx` — reusable input
- `src/components/ui/Spinner.tsx` — loading spinner
- `src/components/form/FormField.tsx` — react-hook-form field wrapper
- `src/components/layout/AppLayout.tsx` — shell with header
- `src/components/layout/RoleGuard.tsx` — role-based route guard
- `src/features/auth/LoginPage.tsx`
- `src/features/auth/RegisterPage.tsx`
- `src/features/auth/AuthLayoutPage.tsx`
- `src/routes/Router.tsx` — router config
- `src/App.tsx` — providers
- `src/main.tsx` — entrypoint

---

## Task 1: Create the `N/` monorepo folder structure

**Files:**
- Create: `N/README.md`, `N/.gitignore`

- [ ] **Step 1: Create the directory tree**

Run:
```bash
mkdir -p N/client N/server N/database
```

- [ ] **Step 2: Write `N/.gitignore`**

```gitignore
# dependencies
node_modules/

# build output
dist/
build/

# env
.env
.env.local
*.local

# logs
*.log
npm-debug.log*

# editor / OS
.DS_Store
.vscode/
.idea/

# misc
*.tsbuildinfo
```

- [ ] **Step 3: Write `N/README.md`**

```markdown
# N — E-Commerce (MySQL rebuild)

Reusable, layered e-commerce. See `../docs/superpowers/specs/2026-06-28-ecommerce-rebuild-design.md`.

## Layout
- `database/` — raw SQL schema + seed
- `server/` — Express + TypeScript, Repository pattern
- `client/` — React + Vite + TypeScript

## Quick start
1. Apply SQL: `mysql -u root -p < database/00-schema.sql` then `database/seed.sql`
2. Server:  `cd server && cp .env.example .env && npm install && npm run dev`
3. Client:  `cd client && cp .env.example .env && npm install && npm run dev`
```

- [ ] **Step 4: Commit**

```bash
cd N && git add -A && git commit -m "chore: scaffold N monorepo (client/server/database)"
```

---

## Task 2: Write the complete MySQL schema

**Files:**
- Create: `N/database/00-schema.sql`
- Create: `N/database/drop.sql`

- [ ] **Step 1: Write `N/database/00-schema.sql`**

```sql
-- N e-commerce schema (MySQL 8)
-- Run with: mysql -u root -p < 00-schema.sql

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- 1. AUTH & USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','seller','customer') NOT NULL DEFAULT 'customer',
    phone         VARCHAR(30) NULL,
    avatar_url    VARCHAR(500) NULL,
    is_verified   TINYINT(1) NOT NULL DEFAULT 0,
    is_banned     TINYINT(1) NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
    id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id            BIGINT UNSIGNED NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip                 VARCHAR(45) NULL,
    user_agent         VARCHAR(500) NULL,
    expires_at         TIMESTAMP NOT NULL,
    revoked_at         TIMESTAMP NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_token (refresh_token_hash),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. SELLER & PROFILE
-- ============================================================================
CREATE TABLE IF NOT EXISTS seller_profiles (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id       BIGINT UNSIGNED NOT NULL,
    company_name  VARCHAR(190) NOT NULL,
    gst_number    VARCHAR(50) NULL,
    bio           TEXT NULL,
    address       VARCHAR(255) NULL,
    rating        DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    total_reviews INT NOT NULL DEFAULT 0,
    status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seller_user (user_id),
    CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_addresses (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED NOT NULL,
    label       VARCHAR(60) NULL,
    full_name   VARCHAR(120) NOT NULL,
    phone       VARCHAR(30) NOT NULL,
    line1       VARCHAR(190) NOT NULL,
    line2       VARCHAR(190) NULL,
    city        VARCHAR(120) NOT NULL,
    state       VARCHAR(120) NULL,
    postal_code VARCHAR(20) NULL,
    country     VARCHAR(120) NOT NULL DEFAULT 'Nepal',
    is_default  TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addr_user (user_id),
    CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. CATALOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(140) NOT NULL,
    description TEXT NULL,
    image_url   VARCHAR(500) NULL,
    parent_id   BIGINT UNSIGNED NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_category_slug (slug),
    KEY idx_category_parent (parent_id),
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code        VARCHAR(60) NOT NULL,
    type        ENUM('percent','fixed') NOT NULL,
    value       DECIMAL(10,2) NOT NULL,
    min_order   DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    max_uses    INT NULL,
    used_count  INT NOT NULL DEFAULT 0,
    valid_from  DATETIME NULL,
    valid_until DATETIME NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    seller_id      BIGINT UNSIGNED NOT NULL,
    category_id    BIGINT UNSIGNED NULL,
    name           VARCHAR(190) NOT NULL,
    slug           VARCHAR(220) NOT NULL,
    description    TEXT NULL,
    price          DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) NULL,
    stock          INT NOT NULL DEFAULT 0,
    sku            VARCHAR(80) NULL,
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_product_slug (slug),
    KEY idx_product_seller (seller_id),
    KEY idx_product_category (category_id),
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    public_id  VARCHAR(200) NULL,
    url        VARCHAR(500) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    position   INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_img_product (product_id),
    CONSTRAINT fk_img_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_reviews (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id  BIGINT UNSIGNED NOT NULL,
    user_id     BIGINT UNSIGNED NOT NULL,
    rating      TINYINT NOT NULL,
    title       VARCHAR(190) NULL,
    comment     TEXT NULL,
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_review_product (product_id),
    KEY idx_review_user (user_id),
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favourites (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fav_user_product (user_id, product_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. CART & ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    BIGINT UNSIGNED NOT NULL,
    coupon_id  BIGINT UNSIGNED NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_cart_user (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cart_id    BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cartitem_cart_product (cart_id, product_id),
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_number   VARCHAR(40) NOT NULL,
    user_id        BIGINT UNSIGNED NOT NULL,
    cart_id        BIGINT UNSIGNED NULL,
    subtotal       DECIMAL(10,2) NOT NULL,
    discount       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    shipping       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    total          DECIMAL(10,2) NOT NULL,
    status         ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_order_number (order_number),
    KEY idx_order_user (user_id),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_cart FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id   BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_oitem_order (order_id),
    CONSTRAINT fk_oitem_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_oitem_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_addresses (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id    BIGINT UNSIGNED NOT NULL,
    full_name   VARCHAR(120) NOT NULL,
    phone       VARCHAR(30) NOT NULL,
    line1       VARCHAR(190) NOT NULL,
    line2       VARCHAR(190) NULL,
    city        VARCHAR(120) NOT NULL,
    state       VARCHAR(120) NULL,
    postal_code VARCHAR(20) NULL,
    country     VARCHAR(120) NOT NULL DEFAULT 'Nepal',
    PRIMARY KEY (id),
    CONSTRAINT fk_oaddr_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id          BIGINT UNSIGNED NOT NULL,
    pidx              VARCHAR(80) NULL,
    transaction_id    VARCHAR(120) NULL,
    tidx              VARCHAR(80) NULL,
    amount            VARCHAR(40) NULL,
    total_amount      VARCHAR(40) NULL,
    mobile            VARCHAR(30) NULL,
    status            VARCHAR(40) NULL,
    purchase_order_name VARCHAR(190) NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_txn_order (order_id),
    CONSTRAINT fk_txn_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 6. CONTENT & NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS banners (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title      VARCHAR(190) NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    link_url   VARCHAR(500) NULL,
    position   VARCHAR(60) NOT NULL DEFAULT 'home',
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    start_at   DATETIME NULL,
    end_at     DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    BIGINT UNSIGNED NOT NULL,
    type       VARCHAR(60) NOT NULL,
    title      VARCHAR(190) NOT NULL,
    message    VARCHAR(500) NULL,
    data       JSON NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_user (user_id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 7. CHAT (Socket.io)
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id    BIGINT UNSIGNED NOT NULL,
    seller_id      BIGINT UNSIGNED NOT NULL,
    product_id     BIGINT UNSIGNED NULL,
    last_message_at TIMESTAMP NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_conv_customer (customer_id),
    KEY idx_conv_seller (seller_id),
    CONSTRAINT fk_conv_customer FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id       BIGINT UNSIGNED NOT NULL,
    content         TEXT NOT NULL,
    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_msg_conv (conversation_id),
    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
```

- [ ] **Step 2: Write `N/database/drop.sql`**

```sql
-- Drops all tables for a clean reset. Use with caution.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS order_addresses;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS favourites;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS seller_profiles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;
```

- [ ] **Step 3: Commit**

```bash
cd N && git add -A && git commit -m "feat(database): add complete MySQL 8 schema and drop script"
```

---

## Task 3: Seed data (admin user + sample catalog)

**Files:**
- Create: `N/database/seed.sql`

- [ ] **Step 1: Generate the admin password hash**

The seed needs a real bcrypt hash for the admin user. Generate it once:

Run:
```bash
node -e "import('bcryptjs').then(b => { console.log(b.default.hashSync('Admin@123', 10)) })"
```
If bcryptjs isn't installed anywhere yet, install it globally first: `npm i -g bcryptjs`, then rerun. Copy the printed hash.

- [ ] **Step 2: Write `N/database/seed.sql`** (paste the hash from Step 1 into `password_hash`)

```sql
-- Seed data. Run AFTER 00-schema.sql.
-- NOTE: password below is 'Admin@123' hashed with bcrypt (cost 10).
-- If the hash placeholder doesn't match your generated hash, replace it.

INSERT INTO users (name, email, password_hash, role, phone, is_verified, is_banned)
VALUES (
    'Admin User',
    'admin@n.test',
    '$2a$10$REPLACE_WITH_GENERATED_HASH_FROM_STEP_1',
    'admin',
    '9800000000',
    1,
    0
);

INSERT INTO categories (name, slug, description, is_active) VALUES
    ('Electronics', 'electronics', 'Gadgets and devices', 1),
    ('Fashion',     'fashion',     'Clothing and accessories', 1),
    ('Home',        'home',        'Home and living', 1);

INSERT INTO banners (title, image_url, position, is_active, sort_order)
VALUES
    ('Welcome to N', 'https://placehold.co/1200x400', 'home', 1, 0),
    ('Big Sale',     'https://placehold.co/1200x400', 'home', 1, 1);
```

- [ ] **Step 3: Commit**

```bash
cd N && git add -A && git commit -m "feat(database): add seed data (admin user + categories + banners)"
```

---

## Task 4: Server package + tooling

**Files:**
- Create: `N/server/package.json`
- Create: `N/server/tsconfig.json`
- Create: `N/server/nodemon.json`
- Create: `N/server/.env.example`
- Create: `N/server/.gitignore`

- [ ] **Step 1: Write `N/server/package.json`**

```json
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.11.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.0",
    "nodemon": "^3.1.4",
    "tsx": "^4.19.0",
    "typescript": "^5.5.4"
  }
}
```

- [ ] **Step 2: Write `N/server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Write `N/server/nodemon.json`**

```json
{
  "watch": ["src"],
  "ext": "ts",
  "execMap": {
    "ts": "tsx src/index.ts"
  }
}
```

- [ ] **Step 4: Write `N/server/.env.example`**

```bash
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=n_ecommerce

# JWT
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

- [ ] **Step 5: Write `N/server/.gitignore`**

```gitignore
node_modules/
dist/
.env
*.log
```

- [ ] **Step 6: Commit**

```bash
cd N/server && git add -A && git commit -m "chore(server): package, tsconfig, env, nodemon setup"
```

---

## Task 5: Server config — env + db pool

**Files:**
- Create: `N/server/src/config/env.ts`
- Create: `N/server/src/config/db.ts`
- Create: `N/server/src/db/pool.ts`

- [ ] **Step 1: Write `N/server/src/config/env.ts`**

```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
```

- [ ] **Step 2: Write `N/server/src/config/db.ts`**

```typescript
import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
});
```

- [ ] **Step 3: Write `N/server/src/db/pool.ts`** (typed query helper)

```typescript
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db.js';

export type { Pool, RowDataPacket, ResultSetHeader };

/**
 * Typed query helper. All repositories use this so SQL results are typed.
 * Usage: const [rows] = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
 */
export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [result] = await pool.query<T>(sql, params);
  return result;
}

/** Run multiple statements in a transaction. Rolls back on error. */
export async function withTransaction<T>(
  work: (conn: Pool) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): typed env loader + mysql2 pool + query helpers"
```

---

## Task 6: Shared types + utils (errors, response, password, token)

**Files:**
- Create: `N/server/src/types/index.ts`
- Create: `N/server/src/utils/errors.ts`
- Create: `N/server/src/utils/response.ts`
- Create: `N/server/src/utils/password.ts`
- Create: `N/server/src/utils/token.ts`

- [ ] **Step 1: Write `N/server/src/types/index.ts`**

```typescript
export type UserRole = 'admin' | 'seller' | 'customer';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_verified: 0 | 1;
  is_banned: 0 | 1;
  created_at: Date;
  updated_at: Date;
}

/** User without sensitive fields — safe to return from the API. */
export type SafeUser = Omit<UserRow, 'password_hash'>;

export interface SessionRow {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  ip: string | null;
  user_agent: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface AuthPayload {
  userId: number;
  role: UserRole;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

/** Augment Express Request with the authenticated user. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
```

- [ ] **Step 2: Write `N/server/src/utils/errors.ts`**

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}
```

- [ ] **Step 3: Write `N/server/src/utils/response.ts`**

```typescript
import type { Response } from 'express';
import type { ApiSuccess } from '../types/index.js';

export function sendSuccess<T>(res: Response, message: string, data: T, status = 200) {
  const body: ApiSuccess<T> = { success: true, message, data };
  return res.status(status).json(body);
}
```

- [ ] **Step 4: Write `N/server/src/utils/password.ts`**

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 5: Write `N/server/src/utils/token.ts`**

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthPayload } from '../types/index.js';

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
}
```

- [ ] **Step 6: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): shared types + utils (errors, response, password, token)"
```

---

## Task 7: Middleware (error, notFound, auth, validate)

**Files:**
- Create: `N/server/src/middleware/error.middleware.ts`
- Create: `N/server/src/middleware/notFound.middleware.ts`
- Create: `N/server/src/middleware/auth.middleware.ts`
- Create: `N/server/src/middleware/validate.middleware.ts`

- [ ] **Step 1: Write `N/server/src/middleware/error.middleware.ts`**

```typescript
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  console.error('💥 Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const unknownEndpoint: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
};
```

- [ ] **Step 2: Write `N/server/src/middleware/notFound.middleware.ts`**

```typescript
export { unknownEndpoint as notFoundHandler } from './error.middleware.js';
```

- [ ] **Step 3: Write `N/server/src/middleware/validate.middleware.ts`**

```typescript
import type { RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
```

- [ ] **Step 4: Write `N/server/src/middleware/auth.middleware.ts`**

```typescript
import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { UserRole } from '../types/index.js';

/** Requires a valid access token. Attaches `req.user` minimal data. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed authorization header'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
    } as never; // minimal; full user loaded on demand by services
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

/** Restricts a route to one or more roles. Must run after authenticate. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
```

- [ ] **Step 5: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): middleware (error, notFound, validate, auth + requireRole)"
```

---

## Task 8: Auth repositories (user + session)

**Files:**
- Create: `N/server/src/repositories/user.repository.ts`
- Create: `N/server/src/repositories/session.repository.ts`

- [ ] **Step 1: Write `N/server/src/repositories/user.repository.ts`**

```typescript
import { query, type RowDataPacket } from '../db/pool.js';
import type { SafeUser, UserRow, UserRole } from '../types/index.js';

/** Strip password_hash from a full row. */
function toSafe(row: UserRow): SafeUser {
  const { password_hash: _omit, ...safe } = row;
  return safe;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await query<UserRow[] & RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<SafeUser | null> {
    const rows = await query<UserRow[] & RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ? toSafe(rows[0]) : null;
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    phone?: string;
  }): Promise<SafeUser> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO users (name, email, password_hash, role, phone, is_verified)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [input.name, input.email.toLowerCase(), input.passwordHash, input.role ?? 'customer', input.phone ?? null]
    );
    const created = await this.findById(result.insertId);
    if (!created) throw new Error('User insert failed');
    return created;
  },

  async existsByEmail(email: string): Promise<boolean> {
    const rows = await query<RowDataPacket[]>(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows.length > 0;
  },
};
```

- [ ] **Step 2: Write `N/server/src/repositories/session.repository.ts`**

```typescript
import { query, type RowDataPacket, type ResultSetHeader } from '../db/pool.js';
import type { SessionRow } from '../types/index.js';

export const sessionRepository = {
  async create(input: {
    userId: number;
    refreshTokenHash: string;
    ip: string | null;
    userAgent: string | null;
    expiresAt: Date;
  }): Promise<number> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO sessions (user_id, refresh_token_hash, ip, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [input.userId, input.refreshTokenHash, input.ip, input.userAgent, input.expiresAt]
    );
    return result.insertId;
  },

  async findActiveByToken(refreshTokenHash: string): Promise<SessionRow | null> {
    const rows = await query<SessionRow[] & RowDataPacket[]>(
      `SELECT * FROM sessions
       WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [refreshTokenHash]
    );
    return rows[0] ?? null;
  },

  async revokeByToken(refreshTokenHash: string): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE sessions SET revoked_at = UTC_TIMESTAMP()
       WHERE refresh_token_hash = ? AND revoked_at IS NULL`,
      [refreshTokenHash]
    );
  },
};
```

- [ ] **Step 3: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): user + session repositories (raw SQL)"
```

---

## Task 9: Auth validators + service

**Files:**
- Create: `N/server/src/validators/auth.validator.ts`
- Create: `N/server/src/services/auth.service.ts`

- [ ] **Step 1: Write `N/server/src/validators/auth.validator.ts`**

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 2: Write `N/server/src/services/auth.service.ts`**

```typescript
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { userRepository as _u } from '../repositories/user.repository.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/errors.js';
import {
  hashPassword,
  comparePassword,
} from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import type { SafeUser, AuthPayload } from '../types/index.js';
import crypto from 'crypto';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function toPayload(user: SafeUser): AuthPayload {
  return { userId: user.id, role: user.role };
}

async function issueTokens(user: SafeUser, ip: string | null, ua: string | null): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = toPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    ip,
    userAgent: ua,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResult> {
    if (await userRepository.existsByEmail(input.email)) {
      throw new ConflictError('Email already registered');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });
    const { accessToken, refreshToken } = await issueTokens(user, null, null);
    return { user, accessToken, refreshToken };
  },

  async login(input: { email: string; password: string }, meta: { ip: string | null; userAgent: string | null }): Promise<AuthResult> {
    const row = await userRepository.findByEmail(input.email.toLowerCase());
    if (!row) throw new UnauthorizedError('Invalid credentials');

    const ok = await comparePassword(input.password, row.password_hash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    if (row.is_banned) throw new ForbiddenError('Account is banned');

    const { password_hash: _omit, ...safe } = row;
    const { accessToken, refreshToken } = await issueTokens(safe, meta.ip, meta.userAgent);
    return { user: safe, accessToken, refreshToken };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: AuthPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
    const session = await sessionRepository.findActiveByToken(hashToken(refreshToken));
    if (!session) throw new UnauthorizedError('Session not found or expired');

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new UnauthorizedError('User not found');

    return { accessToken: signAccessToken(toPayload(user)) };
  },

  async me(userId: number): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return user;
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await sessionRepository.revokeByToken(hashToken(refreshToken));
  },
};

// env import kept for future TTL wiring; referenced to avoid unused import lint.
void env;
```

- [ ] **Step 3: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): auth validators (zod) + auth service"
```

---

## Task 10: Auth controller + routes

**Files:**
- Create: `N/server/src/controllers/auth.controller.ts`
- Create: `N/server/src/routes/auth.routes.ts`

- [ ] **Step 1: Write `N/server/src/controllers/auth.controller.ts`**

```typescript
import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

function getClientMeta(req: import('express').Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.ip || null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const authController: Record<string, RequestHandler> = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, 'Registered successfully', result, 201);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body, getClientMeta(req));
      return sendSuccess(res, 'Logged in successfully', result);
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.body?.refreshToken;
      if (!refreshToken) throw new UnauthorizedError('refreshToken required');
      const result = await authService.refresh(refreshToken);
      return sendSuccess(res, 'Token refreshed', result);
    } catch (err) {
      next(err);
    }
  },

  me: async (req, res, next) => {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const user = await authService.me(req.user.id);
      return sendSuccess(res, 'Current user', user);
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      await authService.logout(req.body?.refreshToken);
      return sendSuccess(res, 'Logged out', null);
    } catch (err) {
      next(err);
    }
  },
};
```

- [ ] **Step 2: Write `N/server/src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export default router;
```

- [ ] **Step 3: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): auth controller + routes"
```

---

## Task 11: Express app + bootstrap

**Files:**
- Create: `N/server/src/app.ts`
- Create: `N/server/src/index.ts`

- [ ] **Step 1: Write `N/server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, unknownEndpoint } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ success: true, message: 'ok', data: { status: 'healthy' } }));

app.use('/api/auth', authRoutes);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
```

- [ ] **Step 2: Write `N/server/src/index.ts`**

```typescript
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function main() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL connected');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

main();
```

- [ ] **Step 3: Install + typecheck + smoke test**

```bash
cd N/server
npm install
npm run typecheck   # expect: no errors
npm run dev         # expect: "✅ MySQL connected" and "🚀 Server running on http://localhost:5000"
```

In another terminal, verify health:
```bash
curl http://localhost:5000/health
# expect: {"success":true,"message":"ok","data":{"status":"healthy"}}
```

- [ ] **Step 4: Commit**

```bash
cd N/server && git add -A && git commit -m "feat(server): express app + bootstrap with DB health check"
```

---

## Task 12: Client package + tooling

**Files:**
- Create: `N/client/package.json`
- Create: `N/client/tsconfig.json`
- Create: `N/client/tsconfig.node.json`
- Create: `N/client/vite.config.ts`
- Create: `N/client/index.html`
- Create: `N/client/.env.example`
- Create: `N/client/.gitignore`

- [ ] **Step 1: Write `N/client/package.json`**

```json
{
  "name": "client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.51.0",
    "antd": "^5.20.0",
    "axios": "^1.7.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.0",
    "react-router-dom": "^6.26.0",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Write `N/client/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Write `N/client/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Write `N/client/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
```

- [ ] **Step 5: Write `N/client/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>N — E-Commerce</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `N/client/.env.example`**

```bash
VITE_API_URL=http://localhost:5000/api
```

- [ ] **Step 7: Write `N/client/.gitignore`**

```gitignore
node_modules/
dist/
.env
*.log
```

- [ ] **Step 8: Commit**

```bash
cd N/client && git add -A && git commit -m "chore(client): vite + react + ts + tailwind + antd tooling"
```

---

## Task 13: Client core (types, lib, axios client, stores)

**Files:**
- Create: `N/client/src/types/index.ts`
- Create: `N/client/src/lib/utils.ts`
- Create: `N/client/src/lib/format.ts`
- Create: `N/client/src/services/api/client.ts`
- Create: `N/client/src/services/api/auth.api.ts`
- Create: `N/client/src/stores/authStore.ts`

- [ ] **Step 1: Write `N/client/src/types/index.ts`**

```typescript
export type UserRole = 'admin' | 'seller' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_verified: 0 | 1;
  is_banned: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

- [ ] **Step 2: Write `N/client/src/lib/utils.ts`**

```typescript
/** Tailwind-friendly className combiner. Filters falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
```

- [ ] **Step 3: Write `N/client/src/lib/format.ts`**

```typescript
export function formatCurrency(amount: number | string, currency = 'NPR'): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
```

- [ ] **Step 4: Write `N/client/src/services/api/client.ts`**

```typescript
import axios, { type AxiosError } from 'axios';
import type { ApiError } from '../../types/index.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

/** Attach access token to every request if present. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalize API errors into a consistent rejected shape. */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message ?? error.message ?? 'Network error';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export type ApiReject = { message: string; errors?: Record<string, string[]>; status?: number };
```

- [ ] **Step 5: Write `N/client/src/services/api/auth.api.ts`**

```typescript
import { api } from './client.js';
import type { ApiSuccess, AuthResult, User } from '../../types/index.js';

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiSuccess<AuthResult>>('/auth/register', body).then((r) => r.data.data),

  login: (body: { email: string; password: string }) =>
    api.post<ApiSuccess<AuthResult>>('/auth/login', body).then((r) => r.data.data),

  me: () =>
    api.get<ApiSuccess<User>>('/auth/me').then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api.post<ApiSuccess<{ accessToken: string }>>('/auth/refresh', { refreshToken }).then((r) => r.data.data),

  logout: (refreshToken: string) =>
    api.post<ApiSuccess<null>>('/auth/logout', { refreshToken }).then((r) => r.data.data),
};
```

- [ ] **Step 6: Write `N/client/src/stores/authStore.ts`**

```typescript
import { create } from 'zustand';
import type { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken });
  },
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token });
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null });
  },
}));
```

- [ ] **Step 7: Commit**

```bash
cd N/client && git add -A && git commit -m "feat(client): types, lib utils, axios client, auth api, zustand auth store"
```

---

## Task 14: Reusable UI + form components

**Files:**
- Create: `N/client/src/components/ui/Button.tsx`
- Create: `N/client/src/components/ui/Input.tsx`
- Create: `N/client/src/components/ui/Spinner.tsx`
- Create: `N/client/src/components/form/FormField.tsx`

- [ ] **Step 1: Write `N/client/src/components/ui/Button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
```

- [ ] **Step 2: Write `N/client/src/components/ui/Input.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
        'placeholder:text-gray-400 focus:outline-none focus:ring-2',
        invalid
          ? 'border-red-400 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        className
      )}
      {...rest}
    />
  )
);
Input.displayName = 'Input';
```

- [ ] **Step 3: Write `N/client/src/components/ui/Spinner.tsx`**

```tsx
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      style={{ width: size, height: size }}
      role="status"
      aria-label="loading"
    />
  );
}
```

- [ ] **Step 4: Write `N/client/src/components/form/FormField.tsx`**

```tsx
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FormField({ label, error, htmlFor, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd N/client && git add -A && git commit -m "feat(client): reusable UI primitives (Button, Input, Spinner) + FormField"
```

---

## Task 15: Auth React Query hooks

**Files:**
- Create: `N/client/src/hooks/useAuth.ts`

- [ ] **Step 1: Write `N/client/src/hooks/useAuth.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api/auth.api.js';
import { useAuthStore } from '../stores/authStore.js';
import type { ApiReject } from '../services/api/client.js';

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => setAuth(data),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setAuth(data),
  });
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !!accessToken,
    retry: false,
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation<void, ApiReject, string>({
    mutationFn: (refreshToken) => authApi.logout(refreshToken).then(() => undefined),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd N/client && git add -A && git commit -m "feat(client): auth react-query hooks (register/login/me/logout)"
```

---

## Task 16: Auth pages (Login + Register + layout)

**Files:**
- Create: `N/client/src/features/auth/AuthLayoutPage.tsx`
- Create: `N/client/src/features/auth/LoginPage.tsx`
- Create: `N/client/src/features/auth/RegisterPage.tsx`

- [ ] **Step 1: Write `N/client/src/features/auth/AuthLayoutPage.tsx`**

```tsx
import { Outlet } from 'react-router-dom';

export default function AuthLayoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">N</h1>
          <p className="text-sm text-gray-500">E-Commerce</p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `N/client/src/features/auth/LoginPage.tsx`**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { FormField } from '../../components/form/FormField.js';
import { useLogin } from '../../hooks/useAuth.js';
import type { ApiReject } from '../../services/api/client.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: () => navigate('/'),
      onError: (err: ApiReject) => setError('root', { message: err.message }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Sign in</h2>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" invalid={!!errors.email} {...register('email')} />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" invalid={!!errors.password} {...register('password')} />
      </FormField>

      {errors.root?.message && <p className="mb-4 text-sm text-red-600">{errors.root.message}</p>}

      <Button type="submit" loading={login.isPending} className="w-full">Sign in</Button>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account? <Link to="/auth/register" className="font-medium text-blue-600 hover:underline">Register</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Write `N/client/src/features/auth/RegisterPage.tsx`**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { FormField } from '../../components/form/FormField.js';
import { useRegister } from '../../hooks/useAuth.js';
import type { ApiReject } from '../../services/api/client.js';

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useRegister();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    registerUser.mutate(values, {
      onSuccess: () => navigate('/'),
      onError: (err: ApiReject) => setError('root', { message: err.message }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Create account</h2>

      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" invalid={!!errors.name} {...register('name')} />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" invalid={!!errors.email} {...register('email')} />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" invalid={!!errors.password} {...register('password')} />
      </FormField>

      <FormField label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" {...register('phone')} />
      </FormField>

      {errors.root?.message && <p className="mb-4 text-sm text-red-600">{errors.root.message}</p>}

      <Button type="submit" loading={registerUser.isPending} className="w-full">Register</Button>

      <p className="mt-4 text-center text-sm text-gray-600">
        Have an account? <Link to="/auth/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd N/client && git add -A && git commit -m "feat(client): auth layout + login + register pages"
```

---

## Task 17: Layout, role guard, router, App providers, entrypoint

**Files:**
- Create: `N/client/src/components/layout/AppLayout.tsx`
- Create: `N/client/src/components/layout/RoleGuard.tsx`
- Create: `N/client/src/routes/Router.tsx`
- Create: `N/client/src/App.tsx`
- Create: `N/client/src/main.tsx`
- Create: `N/client/src/index.css`

- [ ] **Step 1: Write `N/client/src/components/layout/AppLayout.tsx`**

```tsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useLogout } from '../../hooks/useAuth.js';
import { Button } from '../ui/Button.js';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    logout.mutate(refreshToken, { onSettled: () => navigate('/auth/login') });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-gray-900">N</Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-gray-600">Hi, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} loading={logout.isPending}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="text-blue-600 hover:underline">Login</Link>
                <Link to="/auth/register" className="text-blue-600 hover:underline">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Write `N/client/src/components/layout/RoleGuard.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import type { UserRole } from '../../types/index.js';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
}

/** Redirects to /auth/login if not authenticated, or / if role not allowed. */
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 3: Write `N/client/src/routes/Router.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.js';
import { Spinner } from '../components/ui/Spinner.js';

const AuthLayoutPage = lazy(() => import('../features/auth/AuthLayoutPage.js'));
const LoginPage = lazy(() => import('../features/auth/LoginPage.js'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage.js'));

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <div className="text-center text-gray-500">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome to N</h1>
            <p>Product listing comes in Phase 2.</p>
          </div>
        ),
      },
    ],
  },
  {
    path: 'auth',
    element: (
      <Suspense fallback={<div className="flex justify-center p-10"><Spinner /></div>}>
        <AuthLayoutPage />
      </Suspense>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 4: Write `N/client/src/index.css`**

```css
@import "tailwindcss";

html, body, #root { height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
```

- [ ] **Step 5: Write `N/client/src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import Router from './routes/Router.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <Router />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Write `N/client/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 7: Install, typecheck, dev**

```bash
cd N/client
npm install
npm run typecheck   # expect: no errors
npm run dev         # expect: app on http://localhost:5173
```

Manual smoke test: open the app, register a user, confirm redirect to home and header shows the user name. Logout, then login with same credentials.

- [ ] **Step 8: Commit**

```bash
cd N/client && git add -A && git commit -m "feat(client): app layout, role guard, router, providers, entrypoint"
```

---

## Task 18: End-to-end integration verification

- [ ] **Step 1: Apply DB schema + seed**

```bash
mysql -u root -p < N/database/00-schema.sql
mysql -u root -p < N/database/seed.sql
```
Expected: no errors. (If mysql CLI isn't available, apply via your MySQL client / Workbench.)

- [ ] **Step 2: Start server**

```bash
cd N/server
cp .env.example .env   # then edit DB_PASSWORD + secrets
npm install
npm run dev
```
Expected output: `✅ MySQL connected` and `🚀 Server running on http://localhost:5000`

- [ ] **Step 3: Verify auth endpoints with curl**

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@n.test","password":"password123"}'
```
Expected: `201` with `{ success: true, data: { user, accessToken, refreshToken } }`

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@n.test","password":"password123"}'
```
Expected: `200` with tokens. Copy `accessToken`.

Me (paste token):
```bash
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Expected: `200` with the user object.

- [ ] **Step 4: Start client and verify full flow**

```bash
cd N/client
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173. Verify:
1. Register a new user → redirected to home, header shows "Hi, <name>"
2. Logout → header shows Login/Register links
3. Login → back to home with greeting

- [ ] **Step 5: Typecheck both projects**

```bash
cd N/server && npm run typecheck
cd ../client && npm run typecheck
```
Expected: both pass with no errors.

- [ ] **Step 6: Commit any final tweaks**

```bash
cd N && git add -A && git commit -m "test: end-to-end auth verified across all layers"
```

---

## Self-Review Checklist (completed)

- **Spec coverage:** Schema (all domains) ✅ Task 2. Auth vertical slice ✅ Tasks 5–11, 13–17. Infrastructure (server core, client core) ✅. Remaining domains (products, cart, orders, etc.) are explicitly Phase 2 — they follow the identical pattern established here.
- **Placeholder scan:** seed.sql hash must be generated by the engineer (Task 3 Step 1 gives the exact command); no TODO/TBD in code.
- **Type consistency:** `SafeUser`, `AuthResult`, `AuthPayload`, `ApiSuccess`/`ApiError` defined once in `types/index.ts` and used consistently across repositories, services, controllers, and client. `useAuthStore.setAuth` matches `AuthResult` shape. `authApi` return types match `AuthResult`/`User`.
- **Verified conventions:** mysql2 `.js` extension imports used in all ESM TS files (NodeNext/Bundler resolution). `req.user` augmented globally via `Express.Request`. Token storage keys (`accessToken`/`refreshToken`) consistent between `client.ts`, `authStore.ts`, and `AppLayout.tsx`.

## Phase 2 Roadmap (subsequent plans, same pattern)

Each becomes its own focused plan once Phase 1 is verified:
1. **Catalog** — categories + products + images (public read, seller/admin CRUD)
2. **Cart** — cart + cart_items repositories/services/routes + customer UI
3. **Checkout & Orders** — order creation, address snapshot, order history
4. **Payments** — Khalti integration end-to-end
5. **Reviews & Favourites**
6. **Coupons & Banners**
7. **Realtime** — Socket.io chat + notifications
8. **Admin & Seller dashboards**
9. **Email (Nodemailer)** — activation + password reset flows
10. **File uploads (Cloudinary)** — image upload service + UI
