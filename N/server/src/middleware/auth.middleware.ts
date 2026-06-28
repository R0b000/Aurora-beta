import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { UserRole } from '../types/index.js';

/** Requires a valid access token. Attaches minimal user data to req.user. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed authorization header'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      name: '',
      email: '',
      role: payload.role,
      phone: null,
      avatar_url: null,
      is_verified: 0,
      is_banned: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

/** Restricts a route to one or more roles. Must run after authenticate. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
