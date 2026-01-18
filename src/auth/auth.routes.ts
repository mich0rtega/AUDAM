import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/environments', authenticate, AuthController.getEnvironments);
router.get('/me', authenticate, AuthController.me);
router.post('/logout', AuthController.logout);
router.post('/select-environment',authenticate, AuthController.selectEnvironment);
router.post('/refresh', AuthController.refresh);

export default router;
