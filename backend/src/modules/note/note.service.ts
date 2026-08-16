import { Types } from 'mongoose';
import { AppError } from '../../common/errors/AppError.js';
import { noteRepository } from './note.repository.js';
import {
    BulkNoteIdsDto,
    BulkOperationResult,
    CreateNoteDto,
    GetNotesQuery,
    PaginatedNotes,
    UpdateNoteDto,
} from './note.types.js';

export const noteService = {
    create: async (userId: string, data: CreateNoteDto) => {
        const note = await noteRepository.create({
            userId: new Types.ObjectId(userId),
            title: data.title,
            content: data.content,
        });

        return note;
    },

    getAll: async (userId: string, query: GetNotesQuery) => {
        const { page, limit } = query;

        const skip = (page - 1) * limit;

        const { notes, total } = await noteRepository.findByUserId(
            userId,
            skip,
            limit
        );

        return {
            notes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    getTrash: async (
        userId: string,
        query: GetNotesQuery
    ): Promise<PaginatedNotes> => {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const { notes, total } = await noteRepository.findTrashByUserId(
            userId,
            skip,
            limit
        );

        return {
            notes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    getById: async (userId: string, noteId: string) => {
        const note = await noteRepository.findById(noteId, userId);

        if (!note) {
            throw AppError.notFound('Note not found');
        }

        return note;
    },

    update: async (
        userId: string,
        noteId: string,
        data: UpdateNoteDto
    ) => {
        const note = await noteRepository.updateById(
            noteId,
            userId,
            data
        );

        if (!note) {
            throw AppError.notFound('Note not found');
        }

        return note;
    },

    softDeleteById: async (userId: string, noteId: string) => {
        const note = await noteRepository.softDeleteById(
            noteId,
            userId,
            new Date()
        );

        if (!note) {
            throw AppError.notFound('Note not found');
        }

        return note;
    },

    restoreById: async (userId: string, noteId: string) => {
        const note = await noteRepository.restoreById(noteId, userId);

        if (!note) {
            throw AppError.notFound('Note not found');
        }

        return note;
    },

    softDeleteMany: async (
        userId: string,
        data: BulkNoteIdsDto
    ): Promise<BulkOperationResult> => {
        const result = await noteRepository.softDeleteMany(
            data.noteIds,
            userId,
            new Date()
        );

        return {
            modifiedCount: result.modifiedCount,
        };
    },

    restoreMany: async (
        userId: string,
        data: BulkNoteIdsDto
    ): Promise<BulkOperationResult> => {
        const result = await noteRepository.restoreMany(
            data.noteIds,
            userId
        );

        return {
            modifiedCount: result.modifiedCount,
        };
    },
};