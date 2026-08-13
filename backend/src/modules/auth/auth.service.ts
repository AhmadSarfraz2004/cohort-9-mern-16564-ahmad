import { authRepository } from './auth.repository.js';
import { passwordUtils } from '../../common/utils/password.js';
import { jwtUtils } from '../../common/utils/jwt.js';
import { AppError } from '../../common/errors/AppError.js';
import { RegisterDto, LoginDto } from './auth.validation.js';
import logger from '../../config/logger.config.js';

export const authService = {
    register: async (data: RegisterDto) => {
        const existingUser = await authRepository.findByEmail(data.email);
        if (existingUser) {
            throw AppError.conflict('Email is already registered');
        }

        const hashedPassword = await passwordUtils.hashPassword(data.password);

        const user = await authRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });

        logger.info({ userId: user._id }, 'New user registered');

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },

    login: async (data: LoginDto) => {
        const user = await authRepository.findByEmail(data.email, true);
        if (!user) {
            throw AppError.unauthorized('Invalid email or password');
        }

        const isPasswordValid = await passwordUtils.comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw AppError.unauthorized('Invalid email or password');
        }

        const payload = { userId: user._id.toString(), role: user.role };
        const accessToken = jwtUtils.generateAccessToken(payload);
        const refreshToken = jwtUtils.generateRefreshToken(payload);

        await authRepository.updateRefreshToken(user._id.toString(), refreshToken);

        logger.info({ userId: user._id }, 'User logged in');

        return {
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        };
    },

    refreshToken: async (token: string) => {
        let payload;
        try {
            payload = jwtUtils.verifyRefreshToken(token);
        } catch {
            throw AppError.unauthorized('Invalid or expired refresh token');
        }

        const user = await authRepository.findByRefreshToken(token);
        if (!user || user._id.toString() !== payload.userId) {
            throw AppError.unauthorized('Refresh token does not match any active session');
        }

        const newPayload = { userId: user._id.toString(), role: user.role };
        const accessToken = jwtUtils.generateAccessToken(newPayload);
        const newRefreshToken = jwtUtils.generateRefreshToken(newPayload);

        await authRepository.updateRefreshToken(user._id.toString(), newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    },

    logout: async (userId: string) => {
        await authRepository.updateRefreshToken(userId, null);
        logger.info({ userId }, 'User logged out');
    },

    getCurrentUser: async (userId: string) => {
        const user = await authRepository.findById(userId);
        if (!user) {
            throw AppError.notFound('User not found');
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
};