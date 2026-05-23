"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
const http_status_codes_1 = require("http-status-codes");
class AuthController {
    static async signup(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.signup(req.body);
            return (0, response_1.sendSuccess)(res, 'User registered successfully', user, http_status_codes_1.StatusCodes.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const data = await auth_service_1.AuthService.login(req.body);
            return (0, response_1.sendSuccess)(res, 'Login successful', data, http_status_codes_1.StatusCodes.OK);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
