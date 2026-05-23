"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesController = void 0;
const issues_service_1 = require("./issues.service");
const response_1 = require("../../utils/response");
const http_status_codes_1 = require("http-status-codes");
class IssuesController {
    static async createIssue(req, res, next) {
        try {
            const reporterId = req.user.id;
            const issue = await issues_service_1.IssuesService.createIssue(req.body, reporterId);
            return (0, response_1.sendSuccess)(res, 'Issue created successfully', issue, http_status_codes_1.StatusCodes.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllIssues(req, res, next) {
        try {
            const { sort, type, status } = req.query;
            const issues = await issues_service_1.IssuesService.getAllIssues({
                sort: sort,
                type: type,
                status: status,
            });
            return (0, response_1.sendSuccess)(res, 'Issues retrived successfully', issues, http_status_codes_1.StatusCodes.OK);
        }
        catch (error) {
            next(error);
        }
    }
    static async getIssueById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return (0, response_1.sendError)(res, 'Validation failed', 'Issue ID must be a valid integer', http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            const issue = await issues_service_1.IssuesService.getIssueById(id);
            return (0, response_1.sendSuccess)(res, 'Issue retrived successfully', issue, http_status_codes_1.StatusCodes.OK);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateIssue(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return (0, response_1.sendError)(res, 'Validation failed', 'Issue ID must be a valid integer', http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            const issue = await issues_service_1.IssuesService.updateIssue(id, req.body, req.user);
            return (0, response_1.sendSuccess)(res, 'Issue updated successfully', issue, http_status_codes_1.StatusCodes.OK);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteIssue(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return (0, response_1.sendError)(res, 'Validation failed', 'Issue ID must be a valid integer', http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            await issues_service_1.IssuesService.deleteIssue(id);
            return (0, response_1.sendSuccess)(res, 'Issue deleted successfully', null, http_status_codes_1.StatusCodes.OK);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.IssuesController = IssuesController;
exports.default = IssuesController;
