import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const notFoundHandler: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    next(AppError.notFound(`Route '${req.originalUrl}' not found`));
};