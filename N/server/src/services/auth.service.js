import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { hashPassword, comparePassword, hashToken } from '../utils/password.js';
import * as userRepository from '../repositories/user.repository.js';
import * as sessionRepository from '../repositories/session.repository.js';

export async function register({ name, email, password, phone, role }) {
  if (await userRepository.existsByEmail(email)) {
    throw { statusCode: 409, message: 'Email already registered' };
  }
  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({
    name,
    email,
    passwordHash,
    phone,
    role,
  });
  const { accessToken, refreshToken } = await issueTokens(user);
  return { user, accessToken, refreshToken };
}

function toPayload(user) {
  return { userId: user.id, role: user.role };
}

async function issueTokens(user, ip = null, ua = null) {
  const payload = toPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    ip,
    userAgent: ua,
    expiresAt,
  });
  return { accessToken, refreshToken };
}

export async function login({ email, password }, meta = {}) {
  const row = await userRepository.findByEmail(email.toLowerCase());
  if (!row) throw { statusCode: 401, message: 'Invalid credentials' };
  const ok = await comparePassword(password, row.password_hash);
  if (!ok) throw { statusCode: 401, message: 'Invalid credentials' };
  if (row.is_banned) throw { statusCode: 403, message: 'Account is banned' };
  const { password_hash: _omit, ...safe } = row;
  const { accessToken, refreshToken } = await issueTokens(safe, meta.ip, meta.userAgent);
  return { user: safe, accessToken, refreshToken };
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }
  const session = await sessionRepository.findActiveByToken(hashToken(refreshToken));
  if (!session) throw { statusCode: 401, message: 'Session not found or expired' };
  const user = await userRepository.findById(payload.userId);
  if (!user) throw { statusCode: 401, message: 'User not found' };
  return { accessToken: signAccessToken(toPayload(user)) };
}

export async function me(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw { statusCode: 401, message: 'User not found' };
  return user;
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  await sessionRepository.revokeByToken(hashToken(refreshToken));
}

export async function checkEmailExists(email) {
  return userRepository.existsByEmail(email);
}