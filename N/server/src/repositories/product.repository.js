import { query } from '../config/db.js';

export async function findAll(limit = 20, offset = 0) {
  const rows = await query(
    'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows;
}

export async function findBySlug(slug) {
  const rows = await query(
    'SELECT * FROM products WHERE slug = ? LIMIT 1',
    [slug]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const rows = await query(
    'SELECT * FROM products WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function findBySeller(sellerId, limit = 20, offset = 0) {
  const rows = await query(
    'SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [sellerId, limit, offset]
  );
  return rows;
}

export async function create(data) {
  const { seller_id, category_id, name, slug, description, price, discount_price, stock, sku } = data;
  const result = await query(
    'INSERT INTO products (seller_id, category_id, name, slug, description, price, discount_price, stock, sku, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
    [seller_id, category_id || null, name, slug, description || null, price, discount_price || null, stock, sku || null]
  );
  return findById(result.insertId);
}

export async function update(id, seller_id, data) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id, seller_id);
  await query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND seller_id = ?`,
    values
  );
}

export async function remove(id) {
  await query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
}

export async function findByProduct(productId) {
  const rows = await query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC',
    [productId]
  );
  return rows;
}