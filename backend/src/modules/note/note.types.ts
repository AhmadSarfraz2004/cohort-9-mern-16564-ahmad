import { Document, Types } from 'mongoose';

export interface INote {
    userId: Types.ObjectId;
    title: string;
    content: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface INoteDocument extends INote, Document {
    _id: Types.ObjectId;
}

export interface CreateNoteDto {
    title: string;
    content: string;
}

export interface UpdateNoteDto {
    title?: string;
    content?: string;
}

export interface GetNotesQuery {
    page: number;
    limit: number;
}

export interface PaginatedNotes {
    notes: INoteDocument[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface BulkNoteIdsDto {
    noteIds: string[];
}

export interface BulkOperationResult {
    modifiedCount: number;
}