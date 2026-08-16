import { Types } from 'mongoose';
import { NoteModel } from './note.model.js';

export const noteRepository = {
    create: async (data: {
        userId: Types.ObjectId;
        title: string;
        content: string;
    }) => {
        return NoteModel.create(data);
    },

    findById: async (noteId: string, userId: string) => {
        return NoteModel.findOne({
            _id: noteId,
            userId,
            deletedAt: null,
        });
    },

    findByUserId: async (
        userId: string,
        skip: number,
        limit: number
    ) => {
        const [notes, total] = await Promise.all([
            NoteModel.find({ userId, deletedAt: null })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),

            NoteModel.countDocuments({ userId, deletedAt: null }),
        ]);

        return { notes, total };
    },

    findTrashByUserId: async (
        userId: string,
        skip: number,
        limit: number
    ) => {
        const [notes, total] = await Promise.all([
            NoteModel.find({
                userId,
                deletedAt: { $ne: null },
            })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),

            NoteModel.countDocuments({
                userId,
                deletedAt: { $ne: null },
            }),
        ]);

        return { notes, total };
    },

    updateById: async (
        noteId: string,
        userId: string,
        data: {
            title?: string;
            content?: string;
        }
    ) => {
        return NoteModel.findOneAndUpdate(
            {
                _id: noteId,
                userId,
                deletedAt: null,
            },
            {
                $set: data,
            },
            {
                new: true,
                runValidators: true,
            }
        );
    },

    softDeleteById: async (
        noteId: string,
        userId: string,
        deletedAt: Date
    ) => {
        return NoteModel.findOneAndUpdate(
            {
                _id: noteId,
                userId,
                deletedAt: null,
            },
            {
                $set: { deletedAt },
            },
            {
                new: true,
            }
        );
    },

    restoreById: async (noteId: string, userId: string) => {
        return NoteModel.findOneAndUpdate(
            {
                _id: noteId,
                userId,
                deletedAt: { $ne: null },
            },
            {
                $set: { deletedAt: null },
            },
            {
                new: true,
            }
        );
    },

    softDeleteMany: async (
        noteIds: string[],
        userId: string,
        deletedAt: Date
    ) => {
        return NoteModel.updateMany(
            {
                _id: { $in: noteIds },
                userId,
                deletedAt: null,
            },
            {
                $set: { deletedAt },
            }
        );
    },

    restoreMany: async (noteIds: string[], userId: string) => {
        return NoteModel.updateMany(
            {
                _id: { $in: noteIds },
                userId,
                deletedAt: { $ne: null },
            },
            {
                $set: { deletedAt: null },
            }
        );
    },
};