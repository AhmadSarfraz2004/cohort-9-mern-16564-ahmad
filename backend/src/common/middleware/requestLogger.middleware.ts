import { pinoHttp, Options } from 'pino-http';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import logger from '../../config/logger.config.js';

const options: Options<Request, Response> = {
    logger,

    genReqId: (req, res) => {
        const existingId = req.id ?? (req.headers['x-request-id'] as string);
        if (existingId) {
            return existingId;
        }
        const newId = randomUUID();
        res.setHeader('x-request-id', newId);
        return newId;
    },

    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },

    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} completed with ${res.statusCode}`;
    },

    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} failed with ${res.statusCode}: ${err?.message}`;
    },

    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            id: req.id,
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
};

export const requestLogger = pinoHttp(options);