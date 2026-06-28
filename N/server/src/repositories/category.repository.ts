import { executeStoredProcedure } from "../config/db-mssql";

export async function getCategories() {
    const result = await executeStoredProcedure('sp_get_categories');
    return { data: result.recordset.map(c => ({ ...c, _id: c.id })) };
}

export async function getCategoryById(id) {
    const result = await executeStoredProcedure('sp_get_category_by_id', { id });
    if (result.recordset.length === 0) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function createCategory(data) {
    const result = await executeStoredProcedure('sp_create_category', {
        name: data.name,
        slug: data.slug
    });
    return { id: result.recordset[0].id };
}

export async function updateCategory(id, data) {
    await executeStoredProcedure('sp_update_category', {
        id,
        name: data.name || null,
        slug: data.slug || null
    });
}

export async function deleteCategory(id) {
    await executeStoredProcedure('sp_delete_category', { id });
}