import { executeStoredProcedure } from '../config/db-mssql.js';

// Banner operations
const toBanner = (row) => {
    if (!row) return null;
    const { id, ...rest } = row;
    return {
        ...rest,
        _id: id,
        image: row.image_url ? { public_id: row.public_id || null, secure_url: row.image_url } : null,
    };
};

export async function findActive() {
    const result = await executeStoredProcedure('usp_Banner', { Flag: 'R' });
    return result.recordset.map(toBanner);
}

export async function findAll() {
    const result = await executeStoredProcedure('usp_Banner', { Flag: 'R' });
    return result.recordset.map(toBanner);
}

export async function create({ title, image_url, public_id, link_url, position, sort_order }) {
    const params = {
        Flag: 'C',
        title,
        image_url,
        link_url: link_url || null,
        sort_order: sort_order || 0
    };
    if (public_id) params.public_id = public_id;

    const result = await executeStoredProcedure('usp_Banner', params);
    return findById(result.recordset[0].id);
}

export async function update(id, { title, image_url, public_id, link_url, isActive, priority }) {
    const params = {
        Flag: 'U',
        id,
        title: title || null,
        image_url: image_url || null,
        link_url: link_url || null,
        is_active: isActive !== undefined ? (isActive ? 1 : 0) : null,
        sort_order: priority !== undefined ? priority : null
    };
    if (public_id) params.public_id = public_id;

    await executeStoredProcedure('usp_Banner', params);
}

export async function remove(id) {
    await executeStoredProcedure('usp_Banner', { Flag: 'D', id });
}
