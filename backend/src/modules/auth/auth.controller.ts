import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.config.js';
import { RegisterDto, LoginDto } from './auth.validation.js';

const durationToMs = (duration: string): number => {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit as keyof typeof multipliers];
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/auth',
    maxAge: durationToMs(env.JWT_REFRESH_EXPIRES_IN),
};


export const authController = {
    register: asyncHandler(async (req: Request<{}, {}, RegisterDto>, res: Response) => {
        const user = await authService.register(req.body); // req.body now typed as RegisterDto
        res.status(201).json({ success: true, data: user });
    }),

    login: asyncHandler(async (req: Request<{}, {}, LoginDto>, res: Response) => {
        const { user, accessToken, refreshToken } = await authService.login(req.body);
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({ success: true, data: { user, accessToken } });
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
        if (!token) {
            throw AppError.unauthorized('Refresh token missing');
        }

        const { accessToken, refreshToken } = await authService.refreshToken(token);

        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({ success: true, data: { accessToken } });
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        await authService.logout(userId);

        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }),

    getMe: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const user = await authService.getCurrentUser(userId);
        res.status(200).json({ success: true, data: user });
    }),
}
