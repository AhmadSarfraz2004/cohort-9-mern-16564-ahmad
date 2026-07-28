export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly isOperational = true
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = "Bad Request"): AppError {
        return new AppError(message, 400);
    }

    static unauthorized(message = "Unauthorized"): AppError {
        return new AppError(message, 401);
    }

    static forbidden(message = "Forbidden"): AppError {
        return new AppError(message, 403);
    }

    static notFound(message = "Resource not found"): AppError {
        return new AppError(message, 404);
    }

    static conflict(message = "Conflict"): AppError {
        return new AppError(message, 409);
    }
}