"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const http_status_codes_1 = require("http-status-codes");
const JWT_SECRET = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_123!';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return (0, response_1.sendError)(res, 'Authentication failed', 'Token is missing', http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
    // Handle both "Bearer <token>" and raw "<token>"
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Authentication failed', 'Invalid or expired token', http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Authentication failed', 'User context missing', http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 'Access denied', 'Insufficient permissions', http_status_codes_1.StatusCodes.FORBIDDEN);
        }
        next();
    };
};
exports.authorize = authorize;
