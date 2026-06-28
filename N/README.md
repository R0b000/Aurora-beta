# N — E-Commerce (MySQL Rebuild)

Reusable, layered e-commerce. See `../docs/superpowers/specs/2026-06-28-ecommerce-rebuild-design.md`.

## Layout
- `database/` — raw SQL schema + seed
- `server/` — Express + JavaScript (CommonJS), Repository pattern  
- `client/` — React + Vite + TypeScript

## Quick start
1. Apply SQL: `mysql -u root -p < database/00-schema.sql` then `database/seed.sql`
2. Server:  `cd server && cp .env.example .env && npm install && npm run dev`
3. Client:  `cd client && cp .env.example .env && npm install && npm run dev`

## Structure

```
N/
├── client/      # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI
│   │   ├── services/     # API calls
│   │   ├── module/       # Pages by feature
│   │   └── context/      # App state
├── server/      # Node + Express backend
│   ├── src/
│   │   ├── config/       # DB, env
│   │   ├── repositories/ # MySQL queries
│   │   ├── services/     # Business logic
│   │   ├── controllers/  # HTTP handlers
│   │   └── routes/       # Express routes
└── database/    # SQL schema + seed
```