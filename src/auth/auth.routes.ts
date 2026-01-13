import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/environments', authenticate, AuthController.getEnvironments);

export default router;
