import * as authService from '../services/auth.service.js';

function getClientMeta(req) {
  return {
    ip: req.headers['x-forwarded-for']?.split(',')[0] || req.ip || null,
    userAgent: req.headers['user-agent'] || null,
  };
}

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkEmail(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    const exists = await authService.checkEmailExists(email);
    if (exists) {
      return res.status(200).json({
        success: false,
        code: 404,
        message: 'Email already exists',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Email is available',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body, getClientMeta(req));
    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) throw { statusCode: 401, message: 'refreshToken required' };
    const result = await authService.refresh(refreshToken);
    return res.json({
      success: true,
      message: 'Token refreshed',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user?.id) throw { statusCode: 401, message: 'Unauthorized' };
    const user = await authService.me(req.user.id);
    return res.json({
      success: true,
      message: 'Current user',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.body?.refreshToken);
    return res.json({
      success: true,
      message: 'Logged out',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}