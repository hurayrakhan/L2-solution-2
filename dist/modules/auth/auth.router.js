"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
router.post('/signup', validate_1.validateSignup, auth_controller_1.AuthController.signup);
router.post('/login', validate_1.validateLogin, auth_controller_1.AuthController.login);
exports.default = router;
