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

        await authRepository.setRefreshTokenHash(
            user._id.toString(),
            passwordUtils.hashToken(refreshToken)
        );

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

        const presentedHash = passwordUtils.hashToken(token);
        const newPayload = { userId: payload.userId, role: payload.role };
        const newRefreshToken = jwtUtils.generateRefreshToken(newPayload);
        const newHash = passwordUtils.hashToken(newRefreshToken);

        // Atomic: only succeeds if presentedHash still matches what's stored —
        // closes the window where a stolen or replayed token could be reused
        // between verification and update.
        const updatedUser = await authRepository.rotateRefreshTokenHash(
            payload.userId,
            presentedHash,
            newHash
        );

        if (!updatedUser) {
            throw AppError.unauthorized('Refresh token has already been used or revoked');
        }

        const accessToken = jwtUtils.generateAccessToken(newPayload);

        return { accessToken, refreshToken: newRefreshToken };
    },

    logout: async (userId: string) => {
        await authRepository.setRefreshTokenHash(userId, null);
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