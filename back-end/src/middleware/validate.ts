import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map(i => i.message).join(', ');
        console.log(error);
        return res.status(400).json({
          message: `Validation failed: ${message}`,
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
