import { Schema, model } from 'mongoose';
import { INoteDocument } from './note.types.js';

const noteSchema = new Schema<INoteDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [1, 'Title must be at least 1 character'],
            maxlength: [200, 'Title must be at most 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({ userId: 1, deletedAt: 1, updatedAt: -1 });
noteSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const NoteModel = model<INoteDocument>('Note', noteSchema);  