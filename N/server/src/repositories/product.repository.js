import { executeStoredProcedure } from '../config/db-mssql.js';

// Product operations
export async function findAll(limit = 20, offset = 0, sellerId = null) {
    const result = await executeStoredProcedure('usp_Product', { Flag: 'R', seller_id: sellerId || null });
    return result.recordset.slice(offset, offset + limit).map(p => ({ ...p, _id: p.id }));
}

export async function findBySlug(slug) {
    const result = await executeStoredProcedure('usp_Product', { Flag: 'R', slug });
    if (!result.recordset[0]) return null;
    const p = result.recordset[0];
    return { ...p, _id: p.id };
}

export async function findById(id) {
    const result = await executeStoredProcedure('usp_Product', { Flag: 'R', id });
    if (!result.recordset[0]) return null;
    const p = result.recordset[0];
    return { ...p, _id: p.id };
}

export async function findBySeller(sellerId, limit = 20, offset = 0) {
    const result = await executeStoredProcedure('usp_Product', { Flag: 'R', seller_id: sellerId });
    return result.recordset.slice(offset, offset + limit).map(p => ({ ...p, _id: p.id }));
}

export async function create(data) {
    const { seller_id, category_id, name, slug, price, discount_price, stock, sku } = data;
    const result = await executeStoredProcedure('usp_Product', {
        Flag: 'C',
        seller_id,
        category_id: category_id || null,
        name,
        slug,
        price,
        stock: stock || 0
    });
    const id = result.recordset[0].id;
    return { id, insertId: id, _id: id };
}

export async function update(id, seller_id, data) {
    await executeStoredProcedure('usp_Product', {
        Flag: 'U',
        id,
        category_id: data.category_id || null,
        name: data.name || null,
        slug: data.slug || null,
        description: data.description || null,
        price: data.price || null,
        discount_price: data.discount_price || null,
        stock: data.stock || null,
        sku: data.sku || null,
        is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : null
    });
}

export async function remove(id) {
    await executeStoredProcedure('usp_Product', { Flag: 'D', id });
}

export async function findByProduct(productId) {
    return [];
}