import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  const errors: string[] = [];

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
    return sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
  }

  next();
};

export const validateCreateIssue = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, type } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Title is required.');
  } else if (title.length > 150) {
    errors.push('Title must not exceed 150 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('Description is required.');
  } else if (description.length < 20) {
    errors.push('Description must be at least 20 characters long.');
  }

  if (!type || (type !== 'bug' && type !== 'feature_request')) {
    errors.push("Type must be 'bug' or 'feature_request'.");
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
  }

  next();
};

export const validateUpdateIssue = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, type, status } = req.body;
  const errors: string[] = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('Title cannot be empty.');
    } else if (title.length > 150) {
      errors.push('Title must not exceed 150 characters.');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      errors.push('Description cannot be empty.');
    } else if (description.length < 20) {
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
    return sendError(res, 'Validation failed', errors, StatusCodes.BAD_REQUEST);
  }

  next();
};
