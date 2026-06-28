import { query } from '../config/db.js';

export async function findActive() {
  const rows = await query(
    `SELECT * FROM banners
     WHERE is_active = 1
       AND (start_at IS NULL OR start_at <= UTC_TIMESTAMP())
       AND (end_at IS NULL OR end_at >= UTC_TIMESTAMP())
     ORDER BY sort_order ASC, created_at DESC`
  );
  return rows;
}

export async function findAll() {
  const rows = await query(
    'SELECT * FROM banners ORDER BY sort_order ASC'
  );
  return rows;
}

export async function create({ title, image_url, link_url, position, sort_order, start_at, end_at }) {
  const result = await query(
    `INSERT INTO banners (title, image_url, link_url, position, sort_order, start_at, end_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [title, image_url, link_url || null, position || 'home', sort_order || 0, start_at || null, end_at || null]
  );
  const rows = await query('SELECT * FROM banners WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0];
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
    `UPDATE banners SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function remove(id) {
  await query('DELETE FROM banners WHERE id = ?', [id]);
}