import { Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { noteService } from './note.service.js';
import {
    BulkNoteIdsDto,
    CreateNoteDto,
    UpdateNoteDto,
} from './note.types.js';

export const noteController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const note = await noteService.create(
            userId,
            req.body as CreateNoteDto
        );

        res.status(201).json({
            success: true,
            data: note,
        });
    }),

    getAll: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        const result = await noteService.getAll(userId, {
            page,
            limit,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    }),

    getTrash: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        const result = await noteService.getTrash(userId, {
            page,
            limit,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const { id } = req.params;

        if (typeof id !== 'string') {
            throw AppError.badRequest('Invalid note ID');
        }

        const note = await noteService.getById(userId, id);

        res.status(200).json({
            success: true,
            data: note,
        });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const { id } = req.params;

        if (typeof id !== 'string') {
            throw AppError.badRequest('Invalid note ID');
        }

        const note = await noteService.update(
            userId,
            id,
            req.body as UpdateNoteDto
        );

        res.status(200).json({
            success: true,
            data: note,
        });
    }),

    softDeleteById: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const { id } = req.params;

        if (typeof id !== 'string') {
            throw AppError.badRequest('Invalid note ID');
        }

        await noteService.softDeleteById(userId, id);

        res.status(200).json({
            success: true,
            message: 'Note moved to trash successfully',
        });
    }),

    restoreById: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const { id } = req.params;

        if (typeof id !== 'string') {
            throw AppError.badRequest('Invalid note ID');
        }

        const note = await noteService.restoreById(userId, id);

        res.status(200).json({
            success: true,
            data: note,
        });
    }),

    softDeleteMany: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const result = await noteService.softDeleteMany(
            userId,
            req.body as BulkNoteIdsDto
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Notes moved to trash successfully',
        });
    }),

    restoreMany: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw AppError.unauthorized('Not authenticated');
        }

        const result = await noteService.restoreMany(
            userId,
            req.body as BulkNoteIdsDto
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Notes restored successfully',
        });
    }),
};