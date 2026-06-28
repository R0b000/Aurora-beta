import { verifyAccessToken } from '../utils/token.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next({ statusCode: 401, message: 'Missing or malformed authorization header' });
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
    next({ statusCode: 401, message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return next({ statusCode: 403, message: 'Insufficient permissions' });
    }
    next();
  };
}