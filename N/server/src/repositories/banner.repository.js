import { executeStoredProcedure } from '../config/db-mssql.js';

// Banner operations
export async function findActive() {
    const result = await executeStoredProcedure('usp_Banner', { Flag: 'R' });
    return result.recordset.map(c => ({ ...c, _id: c.id }));
}

export async function findAll() {
    const result = await executeStoredProcedure('usp_Banner', { Flag: 'R' });
    return result.recordset.map(c => ({ ...c, _id: c.id }));
}

export async function create({ title, image_url, link_url, position, sort_order }) {
    const result = await executeStoredProcedure('usp_Banner', {
        Flag: 'C',
        title,
        image_url,
        link_url: link_url || null,
        sort_order: sort_order || 0
    });
    return { ...result.recordset[0], _id: result.recordset[0].id, title, image_url, link_url, position };
}

export async function update(id, { title, image_url, link_url, isActive, priority }) {
    await executeStoredProcedure('usp_Banner', {
        Flag: 'U',
        id,
        title: title || null,
        image_url: image_url || null,
        link_url: link_url || null,
        is_active: isActive !== undefined ? (isActive ? 1 : 0) : null,
        sort_order: priority !== undefined ? priority : null
    });
}

export async function remove(id) {
    await executeStoredProcedure('usp_Banner', { Flag: 'D', id });
}