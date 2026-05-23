import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);
  
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return sendError(res, message, errors, status);
};
export default errorHandler;
