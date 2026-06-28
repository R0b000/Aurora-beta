import { query, type RowDataPacket, type ResultSetHeader } from '../db/pool.js';
import type { SafeUser, UserRow, UserRole } from '../types/index.js';

/** Strip password_hash from a full row. */
function toSafe(row: UserRow): SafeUser {
  const { password_hash: _omit, ...safe } = row;
  return safe;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await query<UserRow[] & RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<SafeUser | null> {
    const rows = await query<UserRow[] & RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ? toSafe(rows[0]) : null;
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    phone?: string;
  }): Promise<SafeUser> {
    const result = await query<ResultSetHeader>(
      `INSERT INTO users (name, email, password_hash, role, phone, is_verified)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [input.name, input.email.toLowerCase(), input.passwordHash, input.role ?? 'customer', input.phone ?? null]
    );
    const created = await this.findById(result.insertId);
    if (!created) throw new Error('User insert failed');
    return created;
  },

  async existsByEmail(email: string): Promise<boolean> {
    const rows = await query<RowDataPacket[]>(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows.length > 0;
  },
};
