import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    next(AppError.notFound(`Route '${req.originalUrl}' not found`));
};