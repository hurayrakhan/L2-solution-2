import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { IssuesService } from './issues.service';
import { sendSuccess, sendError } from '../../utils/response';
import { StatusCodes } from 'http-status-codes';

export class IssuesController {
  static async createIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user!.id;
      const issue = await IssuesService.createIssue(req.body, reporterId);
      return sendSuccess(
        res,
        'Issue created successfully',
        issue,
        StatusCodes.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllIssues(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sort, type, status } = req.query;
      const issues = await IssuesService.getAllIssues({
        sort: sort as string,
        type: type as string,
        status: status as string,
      });
      return sendSuccess(
        res,
        'Issues retrived successfully',
        issues,
        StatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  }

  static async getIssueById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(
          res,
          'Validation failed',
          'Issue ID must be a valid integer',
          StatusCodes.BAD_REQUEST
        );
      }
      const issue = await IssuesService.getIssueById(id);
      return sendSuccess(
        res,
        'Issue retrived successfully',
        issue,
        StatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(
          res,
          'Validation failed',
          'Issue ID must be a valid integer',
          StatusCodes.BAD_REQUEST
        );
      }
      const issue = await IssuesService.updateIssue(id, req.body, req.user!);
      return sendSuccess(
        res,
        'Issue updated successfully',
        issue,
        StatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(
          res,
          'Validation failed',
          'Issue ID must be a valid integer',
          StatusCodes.BAD_REQUEST
        );
      }
      await IssuesService.deleteIssue(id);
      return sendSuccess(
        res,
        'Issue deleted successfully',
        null,
        StatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
export default IssuesController;
