import { executeStoredProcedure } from '../config/db-mssql.js';

export async function create({ userId, refreshTokenHash, ip, userAgent, expiresAt }) {
    await executeStoredProcedure('sp_create_session', {
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        ip: ip || null,
        user_agent: userAgent || null,
        expires_at: expiresAt
    });
}

export async function findActiveByToken(refreshTokenHash) {
    const result = await executeStoredProcedure('sp_find_active_session', { refresh_token_hash: refreshTokenHash });
    return result.recordset[0] || null;
}

export async function revokeByToken(refreshTokenHash) {
    await executeStoredProcedure('sp_revoke_session', { refresh_token_hash: refreshTokenHash });
}