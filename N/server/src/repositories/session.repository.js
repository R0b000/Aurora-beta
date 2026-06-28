import { query } from '../config/db.js';
import { hashToken } from '../utils/password.js';

export async function create({ userId, refreshTokenHash, ip, userAgent, expiresAt }) {
  const result = await query(
    'INSERT INTO sessions (user_id, refresh_token_hash, ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, refreshTokenHash, ip, userAgent, expiresAt]
  );
  return result.insertId;
}

export async function findActiveByToken(refreshTokenHash) {
  const rows = await query(
    'SELECT * FROM sessions WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP() LIMIT 1',
    [refreshTokenHash]
  );
  return rows[0] || null;
}

export async function revokeByToken(refreshTokenHash) {
  await query(
    'UPDATE sessions SET revoked_at = UTC_TIMESTAMP() WHERE refresh_token_hash = ? AND revoked_at IS NULL',
    [refreshTokenHash]
  );
}