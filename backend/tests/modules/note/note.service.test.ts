import { expect } from 'chai';
import sinon from 'sinon';
import { Types } from 'mongoose';

import { noteRepository } from '../../../src/modules/note/note.repository.js';
import { noteService } from '../../../src/modules/note/note.service.js';
import { AppError } from '../../../src/common/errors/AppError.js';

describe('noteService', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('create', () => {
        it('should create a note for the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();

            const data = {
                title: 'My Note',
                content: 'Note content',
            };

            const createdNote = {
                _id: new Types.ObjectId(),
                userId: new Types.ObjectId(userId),
                title: data.title,
                content: data.content,
            };

            const createStub = sinon
                .stub(noteRepository, 'create')
                .resolves(createdNote as never);

            const result = await noteService.create(userId, data);

            expect(createStub.calledOnce).to.equal(true);

            expect(createStub.firstCall.args[0]).to.deep.include({
                title: data.title,
                content: data.content,
            });

            expect(createStub.firstCall.args[0].userId.toString())
                .to.equal(userId);

            expect(result).to.equal(createdNote);
        });
    });

    describe('getAll', () => {
        it('should return paginated notes for the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();

            const notes = [
                {
                    _id: new Types.ObjectId(),
                    userId: new Types.ObjectId(userId),
                    title: 'Note 1',
                    content: 'Content 1',
                },
                {
                    _id: new Types.ObjectId(),
                    userId: new Types.ObjectId(userId),
                    title: 'Note 2',
                    content: 'Content 2',
                },
            ];

            const findByUserIdStub = sinon
                .stub(noteRepository, 'findByUserId')
                .resolves({
                    notes,
                    total: 12,
                } as never);

            const result = await noteService.getAll(userId, {
                page: 2,
                limit: 5,
            });

            expect(findByUserIdStub.calledOnceWithExactly(
                userId,
                5,
                5
            )).to.equal(true);

            expect(result.notes).to.equal(notes);

            expect(result.pagination).to.deep.equal({
                page: 2,
                limit: 5,
                total: 12,
                totalPages: 3,
            });
        });

        it('should calculate skip correctly for the first page', async () => {
            const userId = new Types.ObjectId().toString();

            const findByUserIdStub = sinon
                .stub(noteRepository, 'findByUserId')
                .resolves({
                    notes: [],
                    total: 0,
                } as never);

            await noteService.getAll(userId, {
                page: 1,
                limit: 10,
            });

            expect(findByUserIdStub.calledOnceWithExactly(
                userId,
                0,
                10
            )).to.equal(true);
        });

        it('should calculate totalPages correctly', async () => {
            const userId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'findByUserId')
                .resolves({
                    notes: [],
                    total: 21,
                } as never);

            const result = await noteService.getAll(userId, {
                page: 1,
                limit: 10,
            });

            expect(result.pagination.totalPages).to.equal(3);
        });

        it('should return zero totalPages when there are no notes', async () => {
            const userId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'findByUserId')
                .resolves({
                    notes: [],
                    total: 0,
                } as never);

            const result = await noteService.getAll(userId, {
                page: 1,
                limit: 10,
            });

            expect(result.pagination.totalPages).to.equal(0);
        });

        it('should request active notes from repository', async () => {
            const userId = new Types.ObjectId().toString();

            const findByUserIdStub = sinon
                .stub(noteRepository, 'findByUserId')
                .resolves({
                    notes: [],
                    total: 0,
                } as never);

            await noteService.getAll(userId, {
                page: 1,
                limit: 10,
            });

            expect(findByUserIdStub.calledOnceWithExactly(userId, 0, 10))
                .to.equal(true);
        });
    });

    describe('getById', () => {
        it('should return a note belonging to the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            const note = {
                _id: new Types.ObjectId(noteId),
                userId: new Types.ObjectId(userId),
                title: 'My Note',
                content: 'Content',
            };

            const findByIdStub = sinon
                .stub(noteRepository, 'findById')
                .resolves(note as never);

            const result = await noteService.getById(userId, noteId);

            expect(findByIdStub.calledOnceWithExactly(
                noteId,
                userId
            )).to.equal(true);

            expect(result).to.equal(note);
        });

        it('should throw Not Found when the note does not belong to the user', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'findById')
                .resolves(null);

            try {
                await noteService.getById(userId, noteId);
                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });
    });

    describe('update', () => {
        it('should update a note belonging to the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            const data = {
                title: 'Updated title',
            };

            const updatedNote = {
                _id: new Types.ObjectId(noteId),
                userId: new Types.ObjectId(userId),
                title: data.title,
                content: 'Original content',
            };

            const updateStub = sinon
                .stub(noteRepository, 'updateById')
                .resolves(updatedNote as never);

            const result = await noteService.update(
                userId,
                noteId,
                data
            );

            expect(updateStub.calledOnceWithExactly(
                noteId,
                userId,
                data
            )).to.equal(true);

            expect(result).to.equal(updatedNote);
        });

        it('should throw Not Found when updating another user\'s note', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'updateById')
                .resolves(null);

            try {
                await noteService.update(
                    userId,
                    noteId,
                    {
                        title: 'Unauthorized update',
                    }
                );

                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });

        it('should throw Not Found when updating a trashed note', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'updateById')
                .resolves(null);

            try {
                await noteService.update(
                    userId,
                    noteId,
                    {
                        title: 'Updated trashed note',
                    }
                );

                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });
    });

    describe('softDeleteById', () => {
        it('should soft-delete an active note belonging to the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            const trashedNote = {
                _id: new Types.ObjectId(noteId),
                userId: new Types.ObjectId(userId),
                title: 'My Note',
                content: 'Content',
                deletedAt: new Date(),
            };

            const softDeleteStub = sinon
                .stub(noteRepository, 'softDeleteById')
                .resolves(trashedNote as never);

            const result = await noteService.softDeleteById(userId, noteId);

            expect(softDeleteStub.calledOnce).to.equal(true);
            expect(softDeleteStub.firstCall.args[0]).to.equal(noteId);
            expect(softDeleteStub.firstCall.args[1]).to.equal(userId);
            expect(softDeleteStub.firstCall.args[2]).to.be.instanceOf(Date);
            expect(result).to.equal(trashedNote);
        });

        it('should throw Not Found when deleting another user\'s note', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'softDeleteById')
                .resolves(null);

            try {
                await noteService.softDeleteById(userId, noteId);
                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });

        it('should throw Not Found when note does not exist', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'softDeleteById')
                .resolves(null);

            try {
                await noteService.softDeleteById(userId, noteId);
                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });
    });

    describe('getTrash', () => {
        it('should return only deleted notes for the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();
            const trashedNotes = [
                {
                    _id: new Types.ObjectId(),
                    userId: new Types.ObjectId(userId),
                    title: 'Trashed Note',
                    content: 'Content',
                    deletedAt: new Date(),
                },
            ];

            const findTrashStub = sinon
                .stub(noteRepository, 'findTrashByUserId')
                .resolves({
                    notes: trashedNotes,
                    total: 1,
                } as never);

            const result = await noteService.getTrash(userId, {
                page: 1,
                limit: 10,
            });

            expect(findTrashStub.calledOnceWithExactly(
                userId,
                0,
                10
            )).to.equal(true);

            expect(result.notes).to.equal(trashedNotes);
            expect(result.pagination.totalPages).to.equal(1);
        });

        it('should support pagination for trash notes', async () => {
            const userId = new Types.ObjectId().toString();

            const findTrashStub = sinon
                .stub(noteRepository, 'findTrashByUserId')
                .resolves({
                    notes: [],
                    total: 21,
                } as never);

            const result = await noteService.getTrash(userId, {
                page: 2,
                limit: 10,
            });

            expect(findTrashStub.calledOnceWithExactly(
                userId,
                10,
                10
            )).to.equal(true);

            expect(result.pagination).to.deep.equal({
                page: 2,
                limit: 10,
                total: 21,
                totalPages: 3,
            });
        });
    });

    describe('restoreById', () => {
        it('should restore a trashed note belonging to the authenticated user', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            const restoredNote = {
                _id: new Types.ObjectId(noteId),
                userId: new Types.ObjectId(userId),
                title: 'Restored Note',
                content: 'Content',
                deletedAt: null,
            };

            const restoreStub = sinon
                .stub(noteRepository, 'restoreById')
                .resolves(restoredNote as never);

            const result = await noteService.restoreById(userId, noteId);

            expect(restoreStub.calledOnceWithExactly(noteId, userId)).to.equal(true);
            expect(result).to.equal(restoredNote);
        });

        it('should throw Not Found when restoring another user\'s note', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'restoreById')
                .resolves(null);

            try {
                await noteService.restoreById(userId, noteId);
                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });

        it('should throw Not Found when restoring an active note', async () => {
            const userId = new Types.ObjectId().toString();
            const noteId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'restoreById')
                .resolves(null);

            try {
                await noteService.restoreById(userId, noteId);
                expect.fail('Expected AppError to be thrown');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect((error as AppError).statusCode).to.equal(404);
                expect((error as AppError).message).to.equal(
                    'Note not found'
                );
            }
        });
    });

    describe('softDeleteMany', () => {
        it('should soft-delete multiple notes and return modifiedCount', async () => {
            const userId = new Types.ObjectId().toString();
            const noteIds = [
                new Types.ObjectId().toString(),
                new Types.ObjectId().toString(),
                new Types.ObjectId().toString(),
            ];

            const softDeleteManyStub = sinon
                .stub(noteRepository, 'softDeleteMany')
                .resolves({
                    modifiedCount: 2,
                } as never);

            const result = await noteService.softDeleteMany(userId, {
                noteIds,
            });

            expect(softDeleteManyStub.calledOnce).to.equal(true);
            expect(softDeleteManyStub.firstCall.args[0]).to.deep.equal(noteIds);
            expect(softDeleteManyStub.firstCall.args[1]).to.equal(userId);
            expect(softDeleteManyStub.firstCall.args[2]).to.be.instanceOf(Date);
            expect(result).to.deep.equal({
                modifiedCount: 2,
            });
        });

        it('should return zero when another user IDs are ignored by repository filter', async () => {
            const userId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'softDeleteMany')
                .resolves({
                    modifiedCount: 0,
                } as never);

            const result = await noteService.softDeleteMany(userId, {
                noteIds: [new Types.ObjectId().toString()],
            });

            expect(result.modifiedCount).to.equal(0);
        });
    });

    describe('restoreMany', () => {
        it('should restore multiple trashed notes and return modifiedCount', async () => {
            const userId = new Types.ObjectId().toString();
            const noteIds = [
                new Types.ObjectId().toString(),
                new Types.ObjectId().toString(),
            ];

            const restoreManyStub = sinon
                .stub(noteRepository, 'restoreMany')
                .resolves({
                    modifiedCount: 2,
                } as never);

            const result = await noteService.restoreMany(userId, {
                noteIds,
            });

            expect(restoreManyStub.calledOnceWithExactly(noteIds, userId)).to.equal(true);
            expect(result).to.deep.equal({
                modifiedCount: 2,
            });
        });

        it('should not affect another user notes', async () => {
            const userId = new Types.ObjectId().toString();

            sinon
                .stub(noteRepository, 'restoreMany')
                .resolves({
                    modifiedCount: 0,
                } as never);

            const result = await noteService.restoreMany(userId, {
                noteIds: [new Types.ObjectId().toString()],
            });

            expect(result.modifiedCount).to.equal(0);
        });
    });
});