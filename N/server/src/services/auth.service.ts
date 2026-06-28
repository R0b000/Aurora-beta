import { userRepository } from '../repositories/user.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/errors.js';
import {
  hashPassword,
  comparePassword,
} from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import type { SafeUser, AuthPayload } from '../types/index.js';
import crypto from 'crypto';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function toPayload(user: SafeUser): AuthPayload {
  return { userId: user.id, role: user.role };
}

async function issueTokens(user: SafeUser, ip: string | null, ua: string | null): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = toPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    ip,
    userAgent: ua,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResult> {
    if (await userRepository.existsByEmail(input.email)) {
      throw new ConflictError('Email already registered');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });
    const { accessToken, refreshToken } = await issueTokens(user, null, null);
    return { user, accessToken, refreshToken };
  },

  async login(input: { email: string; password: string }, meta: { ip: string | null; userAgent: string | null }): Promise<AuthResult> {
    const row = await userRepository.findByEmail(input.email.toLowerCase());
    if (!row) throw new UnauthorizedError('Invalid credentials');

    const ok = await comparePassword(input.password, row.password_hash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    if (row.is_banned) throw new ForbiddenError('Account is banned');

    const { password_hash: _omit, ...safe } = row;
    const { accessToken, refreshToken } = await issueTokens(safe, meta.ip, meta.userAgent);
    return { user: safe, accessToken, refreshToken };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: AuthPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
    const session = await sessionRepository.findActiveByToken(hashToken(refreshToken));
    if (!session) throw new UnauthorizedError('Session not found or expired');

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new UnauthorizedError('User not found');

    return { accessToken: signAccessToken(toPayload(user)) };
  },

  async me(userId: number): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return user;
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await sessionRepository.revokeByToken(hashToken(refreshToken));
  },
};
