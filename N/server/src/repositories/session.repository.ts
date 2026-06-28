import { query, type RowDataPacket, type ResultSetHeader } from '../db/pool.js';
import type { SessionRow } from '../types/index.js';

export const sessionRepository = {
  async create(input: {
    userId: number;
    refreshTokenHash: string;
    ip: string | null;
    userAgent: string | null;
    expiresAt: Date;
  }): Promise<number> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO sessions (user_id, refresh_token_hash, ip, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [input.userId, input.refreshTokenHash, input.ip, input.userAgent, input.expiresAt]
    );
    return result.insertId;
  },

  async findActiveByToken(refreshTokenHash: string): Promise<SessionRow | null> {
    const rows = await query<SessionRow[] & RowDataPacket[]>(
      `SELECT * FROM sessions
       WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [refreshTokenHash]
    );
    return rows[0] ?? null;
  },

  async revokeByToken(refreshTokenHash: string): Promise<void> {
    await query<ResultSetHeader>(
      `UPDATE sessions SET revoked_at = UTC_TIMESTAMP()
       WHERE refresh_token_hash = ? AND revoked_at IS NULL`,
      [refreshTokenHash]
    );
  },
};
