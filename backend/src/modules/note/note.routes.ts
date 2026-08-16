import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { noteController } from './note.controller.js';
import {
    createNoteSchema,
    getNoteSchema,
    getNotesSchema,
    getTrashSchema,
    restoreManyNotesSchema,
    softDeleteManyNotesSchema,
    updateNoteSchema,
} from './note.validation.js';

const router = Router();

router.use(authMiddleware);

router.post(
    '/',
    validate(createNoteSchema),
    noteController.create
);

router.get(
    '/',
    validate(getNotesSchema),
    noteController.getAll
);

router.get(
    '/trash',
    validate(getTrashSchema),
    noteController.getTrash
);

router.delete(
    '/bulk',
    validate(softDeleteManyNotesSchema),
    noteController.softDeleteMany
);

router.patch(
    '/bulk/restore',
    validate(restoreManyNotesSchema),
    noteController.restoreMany
);

router.get(
    '/:id',
    validate(getNoteSchema),
    noteController.getById
);

router.patch(
    '/:id',
    validate(updateNoteSchema),
    noteController.update
);

router.delete(
    '/:id',
    validate(getNoteSchema),
    noteController.softDeleteById
);

router.patch(
    '/:id/restore',
    validate(getNoteSchema),
    noteController.restoreById
);

export default router;