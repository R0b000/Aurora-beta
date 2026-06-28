import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

function getClientMeta(req: import('express').Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) || req.ip || null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const authController: Record<string, RequestHandler> = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, 'Registered successfully', result, 201);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body, getClientMeta(req));
      return sendSuccess(res, 'Logged in successfully', result);
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.body?.refreshToken;
      if (!refreshToken) throw new UnauthorizedError('refreshToken required');
      const result = await authService.refresh(refreshToken);
      return sendSuccess(res, 'Token refreshed', result);
    } catch (err) {
      next(err);
    }
  },

  me: async (req, res, next) => {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const user = await authService.me(req.user.id);
      return sendSuccess(res, 'Current user', user);
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      await authService.logout(req.body?.refreshToken);
      return sendSuccess(res, 'Logged out', null);
    } catch (err) {
      next(err);
    }
  },
};
