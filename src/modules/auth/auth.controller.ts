import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.signup(req.body);
      return sendSuccess(
        res,
        'User registered successfully',
        user,
        StatusCodes.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.login(req.body);
      return sendSuccess(
        res,
        'Login successful',
        data,
        StatusCodes.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
