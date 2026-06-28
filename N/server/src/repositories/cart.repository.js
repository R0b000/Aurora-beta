import { query } from '../config/db.js';

export async function findActiveByUserId(userId) {
  const rows = await query(
    'SELECT * FROM cart WHERE user_id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

export async function create(userId) {
  const result = await query(
    'INSERT INTO cart (user_id, is_active) VALUES (?, 1)',
    [userId]
  );
  const cartRows = await query('SELECT * FROM cart WHERE id = ? LIMIT 1', [result.insertId]);
  return cartRows[0];
}

export async function findByCart(cartId) {
  const rows = await query(
    'SELECT * FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
  return rows;
}

export async function upsert({ cartId, productId, quantity, unitPrice }) {
  await query(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, productId, quantity, unitPrice]
  );
}

export async function updateQuantity(id, quantity) {
  await query(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, id]
  );
}

export async function removeItem(id) {
  await query('DELETE FROM cart_items WHERE id = ?', [id]);
}