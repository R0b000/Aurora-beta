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