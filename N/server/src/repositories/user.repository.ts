import { executeStoredProcedure } from "../config/db-mssql";

export async function getUsers() {
    const result = await executeStoredProcedure('sp_get_users');
    return result.recordset.map(u => ({ ...u, _id: u.id }));
}

export async function getUserById(id) {
    const result = await executeStoredProcedure('sp_get_user_by_id', { id });
    if (result.recordset.length === 0) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function getUserByEmail(email) {
    const result = await executeStoredProcedure('sp_get_user_by_email', { email });
    if (result.recordset.length === 0) return null;
    return result.recordset[0];
}

export async function createUser(data) {
    const result = await executeStoredProcedure('sp_create_user', {
        name: data.name,
        email: data.email,
        password_hash: data.password,
        role: data.role || 'customer',
        phone: data.phone || null
    });
    return { id: result.recordset[0].id };
}

export async function updateUser(id, data) {
    await executeStoredProcedure('sp_update_user', {
        id,
        name: data.name || null,
        phone: data.phone || null,
        is_ban: data.isBan !== undefined ? (data.isBan ? 1 : 0) : null
    });
}

export async function deleteUser(id) {
    await executeStoredProcedure('sp_delete_user', { id });
}