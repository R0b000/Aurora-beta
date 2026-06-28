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
