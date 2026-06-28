import { query } from '../config/db.js';

export async function findAll() {
  const rows = await query(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
}

export async function findBySlug(slug) {
  const rows = await query(
    'SELECT * FROM categories WHERE slug = ? LIMIT 1',
    [slug]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const rows = await query(
    'SELECT * FROM categories WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function create({ name, slug, description, image_url, parent_id }) {
  const result = await query(
    'INSERT INTO categories (name, slug, description, image_url, parent_id, is_active) VALUES (?, ?, ?, ?, ?, 1)',
    [name, slug, description || null, image_url || null, parent_id || null]
  );
  return findById(result.insertId);
}

export async function update(id, data) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  await query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function remove(id) {
  await query('DELETE FROM categories WHERE id = ?', [id]);
}