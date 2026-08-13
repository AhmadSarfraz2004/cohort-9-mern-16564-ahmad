import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Backend is running successfully.",
        timestamp: new Date().toISOString(),
    });
});

router.use("/auth", authRoutes);

export default router;