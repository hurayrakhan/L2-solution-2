import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload } from '../types/auth';
import { sendError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_123!';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(
      res,
      'Authentication failed',
      'Token is missing',
      StatusCodes.UNAUTHORIZED
    );
  }

  // Handle both "Bearer <token>" and raw "<token>"
  let token = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(
      res,
      'Authentication failed',
      'Invalid or expired token',
      StatusCodes.UNAUTHORIZED
    );
  }
};

export const authorize = (roles: ('contributor' | 'maintainer')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication failed',
        'User context missing',
        StatusCodes.UNAUTHORIZED
      );
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        'Access denied',
        'Insufficient permissions',
        StatusCodes.FORBIDDEN
      );
    }

    next();
  };
};
