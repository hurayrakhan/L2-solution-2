import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateSignup, validateLogin } from '../../middleware/validate';

const router = Router();

router.post('/signup', validateSignup, AuthController.signup);
router.post('/login', validateLogin, AuthController.login);

export default router;
