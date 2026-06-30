import { executeStoredProcedure } from '../config/db-mssql.js';

// User operations
export async function findByEmail(email) {
    const result = await executeStoredProcedure('usp_User', { Flag: 'R', email: email.toLowerCase() });
    if (!result.recordset[0]) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function findById(id) {
    const result = await executeStoredProcedure('usp_User', { Flag: 'R', id });
    if (!result.recordset[0]) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function existsByEmail(email) {
    const result = await executeStoredProcedure('usp_User', { Flag: 'E', email: email.toLowerCase() });
    return result.recordset[0].exists_count > 0;
}

export async function create({ name, email, passwordHash, role = 'customer', phone }) {
    const result = await executeStoredProcedure('usp_User', {
        Flag: 'C',
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role,
        phone: phone || null
    });
    if (!result.recordset[0]) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function findAll() {
    const result = await executeStoredProcedure('usp_User', { Flag: 'R' });
    return result.recordset.map(u => ({ ...u, _id: u.id }));
}

export async function update(id, data) {
    await executeStoredProcedure('usp_User', {
        Flag: 'U',
        id,
        name: data.name || null,
        phone: data.phone || null,
        is_banned: data.is_banned !== undefined ? (data.is_banned ? 1 : 0) : null
    });
    const updated = await findById(id);
    return updated;
}

export async function remove(id) {
    await executeStoredProcedure('usp_User', { Flag: 'D', id });
    return true;
}
