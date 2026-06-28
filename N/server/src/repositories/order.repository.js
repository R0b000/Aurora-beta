import { query } from '../config/db.js';

export async function create({ orderNumber, userId, cartId, subtotal, discount, shipping, total }) {
  const result = await query(
    `INSERT INTO orders (order_number, user_id, cart_id, subtotal, discount, shipping, total, status, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
    [orderNumber, userId, cartId || null, subtotal, discount, shipping, total]
  );
  const rows = await query('SELECT * FROM orders WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0];
}

export async function findByUser(userId, limit = 20, offset = 0) {
  const rows = await query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
  return rows;
}

export async function findById(id, userId) {
  const rows = await query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  return rows[0] || null;
}

export async function createItems(items) {
  if (items.length === 0) return;
  const values = [];
  const sqlValues = [];
  for (const item of items) {
    sqlValues.push('(?, ?, ?, ?, ?)');
    values.push(item.orderId, item.productId, item.quantity, item.unitPrice, item.lineTotal);
  }
  await query(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES ${sqlValues.join(', ')}`,
    values
  );
}

export async function insertAddress(orderId, address) {
  await query(
    `INSERT INTO order_addresses (order_id, full_name, phone, line1, line2, city, state, postal_code, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderId, address.full_name, address.phone, address.line1, address.line2 || null, address.city, address.state || null, address.postal_code || null, address.country || 'Nepal']
  );
}