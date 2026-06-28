import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db.js';

export type { Pool, RowDataPacket, ResultSetHeader };

/**
 * Typed query helper. All repositories use this so SQL results are typed.
 * Usage: const [rows] = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
 */
export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [result] = await pool.query<T>(sql, params);
  return result;
}

/** Run multiple statements in a transaction. Rolls back on error. */
export async function withTransaction<T>(
  work: (conn: Pool) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
