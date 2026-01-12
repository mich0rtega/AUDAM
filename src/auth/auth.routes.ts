import { Router } from 'express';
import {
  login,
  me,
  logout,
  selectEnvironment,
} from './auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/select-environment', authenticate, selectEnvironment);
router.post('/logout', authenticate, logout);

export default router;
