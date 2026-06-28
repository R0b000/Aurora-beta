import { executeStoredProcedure } from '../config/db-mssql.js';

// Order operations
export async function create({ orderNumber, userId, cartId, subtotal, discount, shipping, total }) {
    const result = await executeStoredProcedure('usp_Order', {
        Flag: 'C',
        user_id: userId,
        subtotal,
        discount: discount || 0,
        shipping: shipping || 0,
        total
    });
    
    return {
        id: result.recordset[0].id,
        order_number: result.recordset[0].order_number,
        user_id: userId,
        subtotal,
        discount: discount || 0,
        shipping: shipping || 0,
        total,
        status: 'pending',
        payment_status: 'unpaid'
    };
}

export async function findByUser(userId, limit = 20, offset = 0) {
    const result = await executeStoredProcedure('usp_Order', { Flag: 'R', user_id: userId });
    return result.recordset;
}

export async function findById(id, userId) {
    // Need separate implementation with userId check
    return null;
}

export async function createItems(items) {
    if (items.length === 0) return;
    
    for (const item of items) {
        await executeStoredProcedure('usp_Order', {
            Flag: 'I',
            order_id: item.orderId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice
        });
    }
}

export async function insertAddress(orderId, address) {
    await executeStoredProcedure('usp_Order', {
        Flag: 'A',
        order_id: orderId,
        full_name: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state || null,
        postal_code: address.postal_code || null,
        country: address.country || 'Nepal'
    });
}