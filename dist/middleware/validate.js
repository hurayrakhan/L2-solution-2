"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateIssue = exports.validateCreateIssue = exports.validateLogin = exports.validateSignup = void 0;
const response_1 = require("../utils/response");
const http_status_codes_1 = require("http-status-codes");
const validateSignup = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];
    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push('Name is required.');
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Valid email is required.');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Password is required.');
    }
    if (role !== undefined && role !== 'contributor' && role !== 'maintainer') {
        errors.push("Role must be 'contributor' or 'maintainer'.");
    }
    if (errors.length > 0) {
        return (0, response_1.sendError)(res, 'Validation failed', errors, http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    next();
};
exports.validateSignup = validateSignup;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || typeof email !== 'string') {
        errors.push('Email is required.');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Password is required.');
    }
    if (errors.length > 0) {
        return (0, response_1.sendError)(res, 'Validation failed', errors, http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    next();
};
exports.validateLogin = validateLogin;
const validateCreateIssue = (req, res, next) => {
    const { title, description, type } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required.');
    }
    else if (title.length > 150) {
        errors.push('Title must not exceed 150 characters.');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        errors.push('Description is required.');
    }
    else if (description.length < 20) {
        errors.push('Description must be at least 20 characters long.');
    }
    if (!type || (type !== 'bug' && type !== 'feature_request')) {
        errors.push("Type must be 'bug' or 'feature_request'.");
    }
    if (errors.length > 0) {
        return (0, response_1.sendError)(res, 'Validation failed', errors, http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    next();
};
exports.validateCreateIssue = validateCreateIssue;
const validateUpdateIssue = (req, res, next) => {
    const { title, description, type, status } = req.body;
    const errors = [];
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            errors.push('Title cannot be empty.');
        }
        else if (title.length > 150) {
            errors.push('Title must not exceed 150 characters.');
        }
    }
    if (description !== undefined) {
        if (typeof description !== 'string' || description.trim() === '') {
            errors.push('Description cannot be empty.');
        }
        else if (description.length < 20) {
            errors.push('Description must be at least 20 characters long.');
        }
    }
    if (type !== undefined && type !== 'bug' && type !== 'feature_request') {
        errors.push("Type must be 'bug' or 'feature_request'.");
    }
    if (status !== undefined && status !== 'open' && status !== 'in_progress' && status !== 'resolved') {
        errors.push("Status must be 'open', 'in_progress', or 'resolved'.");
    }
    if (errors.length > 0) {
        return (0, response_1.sendError)(res, 'Validation failed', errors, http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    next();
};
exports.validateUpdateIssue = validateUpdateIssue;
