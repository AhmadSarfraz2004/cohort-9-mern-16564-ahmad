import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../../config/env.config.js";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;

    if (err instanceof AppError) {
        req.log.warn({ err, statusCode }, err.message);
    } else {
        req.log.error({ err }, "Unexpected error");
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message:
            err instanceof AppError
                ? err.message
                : "Internal Server Error",
        ...(env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};