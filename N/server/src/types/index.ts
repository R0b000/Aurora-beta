export type UserRole = 'admin' | 'seller' | 'customer';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_verified: 0 | 1;
  is_banned: 0 | 1;
  created_at: Date;
  updated_at: Date;
}

/** User without sensitive fields — safe to return from the API. */
export type SafeUser = Omit<UserRow, 'password_hash'>;

export interface SessionRow {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  ip: string | null;
  user_agent: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface AuthPayload {
  userId: number;
  role: UserRole;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

/** Augment Express Request with the authenticated user. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
