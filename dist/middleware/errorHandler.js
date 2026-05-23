"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const http_status_codes_1 = require("http-status-codes");
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const status = err.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || null;
    return (0, response_1.sendError)(res, message, errors, status);
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
