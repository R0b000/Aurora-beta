import { executeStoredProcedure } from '../config/db-mssql.js';

// Category operations
export async function findAll() {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', is_active: 1 });
    return result.recordset.map(c => ({ ...c, _id: c.id }));
}

export async function findBySlug(slug) {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', slug, is_active: 1 });
    if (!result.recordset[0]) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function findById(id) {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', id });
    if (!result.recordset[0]) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function create({ name, slug, description, image_url, parent_id }) {
    const result = await executeStoredProcedure('usp_Category', {
        Flag: 'C',
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        parent_id: parent_id || null
    });
    return findById(result.recordset[0].id);
}

export async function update(id, data) {
    await executeStoredProcedure('usp_Category', {
        Flag: 'U',
        id,
        name: data.name || null,
        slug: data.slug || null,
        description: data.description || null,
        image_url: data.image_url || null,
        parent_id: data.parent_id || null,
        is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : null
    });
}

export async function remove(id) {
    await executeStoredProcedure('usp_Category', { Flag: 'D', id });
}