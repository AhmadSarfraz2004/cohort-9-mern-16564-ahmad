import { Types } from 'mongoose';
import { z } from 'zod';

const MAX_CONTENT_LENGTH = 50000;
const MAX_BULK_NOTE_IDS = 100;

const noteIdParamSchema = z.object({
    id: z
        .string()
        .refine((value) => Types.ObjectId.isValid(value), {
            message: 'Invalid note ID',
        }),
});

const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(1),

    limit: z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(10),
});

const noteIdsBodySchema = z.object({
    noteIds: z
        .array(
            z
                .string()
                .refine((value) => Types.ObjectId.isValid(value), {
                    message: 'Invalid note ID',
                })
        )
        .min(1, 'At least one note ID is required')
        .max(
            MAX_BULK_NOTE_IDS,
            `Note IDs cannot exceed ${MAX_BULK_NOTE_IDS}`
        ),
});

const updateNoteBodySchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, 'Title must be at least 1 character')
            .max(200, 'Title must be at most 200 characters')
            .optional(),

        content: z
            .string()
            .trim()
            .min(1, 'Content must be at least 1 character')
            .max(
                MAX_CONTENT_LENGTH,
                `Content must be at most ${MAX_CONTENT_LENGTH} characters`
            )
            .optional(),
    })
    .refine(
        (data) =>
            data.title !== undefined ||
            data.content !== undefined,
        {
            message: 'At least one field is required for update',
        }
    );

export const createNoteSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, 'Title is required')
            .max(200, 'Title must be at most 200 characters'),

        content: z
            .string()
            .trim()
            .min(1, 'Content is required')
            .max(
                MAX_CONTENT_LENGTH,
                `Content must be at most ${MAX_CONTENT_LENGTH} characters`
            ),
    }),
});

export const getNotesSchema = z.object({
    query: paginationQuerySchema,
});

export const getTrashSchema = z.object({
    query: paginationQuerySchema,
});

export const updateNoteSchema = z.object({
    params: noteIdParamSchema,
    body: updateNoteBodySchema,
});

export const getNoteSchema = z.object({
    params: noteIdParamSchema,
});

export const softDeleteManyNotesSchema = z.object({
    body: noteIdsBodySchema,
});

export const restoreManyNotesSchema = z.object({
    body: noteIdsBodySchema,
});