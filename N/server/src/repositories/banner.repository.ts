import { executeStoredProcedure } from "../config/db-mssql";

export async function findActive() {
    const result = await executeStoredProcedure('sp_get_active_banners', { isActive: null });
    return result.recordset;
}

export async function findAll() {
    const result = await executeStoredProcedure('sp_get_active_banners', { isActive: null });
    return result.recordset;
}

export async function create({ title, image_url, link_url, position, sort_order, start_at, end_at }) {
    const result = await executeStoredProcedure('sp_create_banner', {
        title,
        image_url,
        link_url,
        position,
        sort_order,
        start_at,
        end_at
    });
    return { id: result.recordset[0].id, title, image_url, link_url, position };
}

export async function update(id, { title, image, linkUrl, isActive, priority }) {
    await executeStoredProcedure('sp_update_banner', {
        id,
        title: title || null,
        image_url: image || null,
        link_url: linkUrl || null,
        is_active: isActive !== undefined ? (isActive ? 1 : 0) : null,
        sort_order: priority !== undefined ? priority : null
    });
}

export async function remove(id) {
    await executeStoredProcedure('sp_delete_banner', { id });
}