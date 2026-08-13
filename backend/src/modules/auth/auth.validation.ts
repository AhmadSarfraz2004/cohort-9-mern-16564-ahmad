import { z } from 'zod';

const passwordByteLimit = z.string().refine(
    (val) => Buffer.byteLength(val, 'utf8') <= 72,
    { message: 'Password must not exceed 72 bytes' }
);

const passwordField = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .and(passwordByteLimit);

export const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(50),
        email: z.string().trim().toLowerCase().email(),
        password: passwordField,
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email(),
        password: z.string().min(1, 'Password is required').and(passwordByteLimit),
    }),
});

// Inferred types — reuse these in service/controller instead of writing duplicate interfaces
export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];