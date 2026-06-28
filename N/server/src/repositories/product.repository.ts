import { executeStoredProcedure, executeQuery } from "../config/db-mssql";

export async function listProducts(sellerId = null) {
    const result = await executeStoredProcedure('sp_get_products', { sellerId });
    const products = result.recordset.map(p => ({
        ...p,
        _id: p.id,
        category: p.category_id ? { _id: p.category_id, name: p.category_name } : null
    }));
    return { data: products };
}

export async function getProductById(id) {
    const result = await executeStoredProcedure('sp_get_product_by_id', { id });
    if (result.recordset.length === 0) return null;
    const p = result.recordset[0];
    return {
        ...p,
        _id: p.id,
        category: p.category_id ? { _id: p.category_id, name: p.category_name } : null
    };
}

export async function createProduct(data) {
    const result = await executeStoredProcedure('sp_create_product', {
        seller_id: data.seller,
        category_id: data.category || null,
        name: data.name,
        slug: data.slug,
        price: data.price,
        stock: data.stock || 0
    });
    return { id: result.recordset[0].id };
}

export async function updateProduct(id, data) {
    await executeStoredProcedure('sp_update_product', {
        id,
        name: data.name || null,
        price: data.price || null,
        stock: data.stock || null,
        is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : null
    });
}

export async function deleteProduct(id) {
    await executeStoredProcedure('sp_delete_product', { id });
}