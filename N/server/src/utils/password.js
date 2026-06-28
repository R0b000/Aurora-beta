import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}