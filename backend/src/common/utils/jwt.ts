import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.config.js';

export interface JwtPayload {
  userId: string;
  role: string;
}

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
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  },

  verifyRefreshToken: (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  },
};