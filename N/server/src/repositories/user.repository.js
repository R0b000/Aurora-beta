import { query } from '../config/db.js';

export async function findByEmail(email) {
  const rows = await query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  if (!rows[0]) return null;
  return { ...rows[0], _id: rows[0].id };
}

export async function findById(id) {
  const rows = await query(
    'SELECT id, name, email, role, phone, avatar_url, is_verified, is_banned, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows[0]) return null;
  return { ...rows[0], _id: rows[0].id };
}

export async function create({ name, email, passwordHash, role = 'customer', phone }) {
  const result = await query(
    'INSERT INTO users (name, email, password_hash, role, phone, is_verified) VALUES (?, ?, ?, ?, ?, 1)',
    [name, email.toLowerCase(), passwordHash, role, phone || null]
  );
  return findById(result.insertId);
}

export async function existsByEmail(email) {
  const rows = await query(
    'SELECT 1 FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  return rows.length > 0;
}