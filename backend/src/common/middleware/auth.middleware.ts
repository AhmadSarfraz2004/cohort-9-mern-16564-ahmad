import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt.js';
import { AppError } from '../errors/AppError.js';

export interface AuthenticatedUser {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        throw AppError.unauthorized('Access token missing');
    }

    const token = authHeader.split(' ')[1];

    let payload;

    try {
        payload = jwtUtils.verifyAccessToken(token);
    } catch {
        throw AppError.unauthorized('Invalid or expired access token');
    }

    req.user = {
        userId: payload.userId,
        role: payload.role,
    };

    next();
};