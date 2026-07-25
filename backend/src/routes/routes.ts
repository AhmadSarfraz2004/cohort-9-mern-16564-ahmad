import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Backend is running successfully.",
        timestamp: new Date().toISOString(),
    });
});

export default router;