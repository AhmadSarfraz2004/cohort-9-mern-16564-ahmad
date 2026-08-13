import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            }) as { body?: unknown };

            if (parsed.body !== undefined) {
                req.body = parsed.body;
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: err.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
            }
            next(err);
        }
    };