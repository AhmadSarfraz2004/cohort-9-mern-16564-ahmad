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

    static badRequest(message = "Bad Request") {
        return new AppError(message, 400);
    }

    static unauthorized(message = "Unauthorized") {
        return new AppError(message, 401);
    }

    static forbidden(message = "Forbidden") {
        return new AppError(message, 403);
    }

    static notFound(message = "Resource not found") {
        return new AppError(message, 404);
    }

    static conflict(message = "Conflict") {
        return new AppError(message, 409);
    }
}