import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.config.js';

export interface JwtPayload {
    userId: string;
    role: string;
}

const assertPayload = (decoded: unknown): JwtPayload => {
    if (
        typeof decoded !== 'object' ||
        decoded === null ||
        typeof (decoded as JwtPayload).userId !== 'string' ||
        typeof (decoded as JwtPayload).role !== 'string'
    ) {
        throw new Error('Malformed token payload');
    }

    return decoded as JwtPayload;
};

export const jwtUtils = {
    generateAccessToken: (payload: JwtPayload): string => {
        return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
            expiresIn: env.JWT_ACCESS_EXPIRATION,
        } as SignOptions);
    },

    generateRefreshToken: (payload: JwtPayload): string => {
        return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        } as SignOptions);
    },

    verifyAccessToken: (token: string): JwtPayload => {
        return assertPayload(
            jwt.verify(token, env.JWT_ACCESS_SECRET)
        );
    },

    verifyRefreshToken: (token: string): JwtPayload => {
        return assertPayload(
            jwt.verify(token, env.JWT_REFRESH_SECRET)
        );
    },
};