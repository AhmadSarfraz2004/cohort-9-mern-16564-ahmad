import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from '../../common/middleware/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;