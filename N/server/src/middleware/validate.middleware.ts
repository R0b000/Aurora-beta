import type { RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
