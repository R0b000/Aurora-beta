import { executeStoredProcedure } from '../config/db-mssql.js';

// Cart operations
export async function findActiveByUserId(userId) {
    const result = await executeStoredProcedure('usp_Cart', { Flag: 'R', user_id: userId });
    return result.recordset[0] || null;
}

export async function create(userId) {
    const result = await executeStoredProcedure('usp_Cart', { Flag: 'C', user_id: userId });
    return { id: result.recordset[0].id, user_id: userId, is_active: 1 };
}

export async function findByCart(cartId) {
    // Raw query needed for cart items join
    const result = await executeStoredProcedure('usp_Cart', { Flag: 'R' });
    // This needs separate implementation - placeholder for now
    return [];
}

export async function upsert({ cartId, productId, quantity, unitPrice }) {
    await executeStoredProcedure('usp_Cart', {
        Flag: 'I',
        cart_id: cartId,
        product_id: productId,
        quantity,
        unit_price: unitPrice
    });
}

export async function updateQuantity(id, quantity) {
    await executeStoredProcedure('usp_Cart', { Flag: 'U', cart_id: id, quantity });
}

export async function removeItem(id) {
    await executeStoredProcedure('usp_Cart', { Flag: 'D', cart_id: id });
}