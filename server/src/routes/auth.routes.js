import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, otpSchema } from '../utils/schemas.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/verify-otp', validate(otpSchema), authController.verifyOTP);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticateUser, authController.getMe);

export default router;
