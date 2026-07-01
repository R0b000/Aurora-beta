import { executeStoredProcedure } from '../config/db-mssql.js';

// Category operations
const toCategory = (row) => {
    if (!row) return null;
    const { id, ...rest } = row;
    return {
        ...rest,
        _id: id,
        image: row.image_url ? { public_id: row.public_id || null, secure_url: row.image_url } : null,
    };
};

export async function findAll() {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', is_active: 1 });
    return result.recordset.map(toCategory);
}

export async function findBySlug(slug) {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', slug, is_active: 1 });
    if (!result.recordset[0]) return null;
    return toCategory(result.recordset[0]);
}

export async function findById(id) {
    const result = await executeStoredProcedure('usp_Category', { Flag: 'R', id });
    if (!result.recordset[0]) return null;
    return toCategory(result.recordset[0]);
}

export async function create({ name, slug, description, image_url, public_id, parent_id }) {
    const params = {
        Flag: 'C',
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        parent_id: parent_id || null
    };
    if (public_id) params.public_id = public_id;

    const result = await executeStoredProcedure('usp_Category', params);
    return findById(result.recordset[0].id);
}

export async function update(id, data) {
    const params = {
        Flag: 'U',
        id,
        name: data.name || null,
        slug: data.slug || null,
        description: data.description || null,
        image_url: data.image_url || null,
        parent_id: data.parent_id || null,
        is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : null
    };
    if (data.public_id) params.public_id = data.public_id;

    await executeStoredProcedure('usp_Category', params);
}

export async function remove(id) {
    await executeStoredProcedure('usp_Category', { Flag: 'D', id });
}
