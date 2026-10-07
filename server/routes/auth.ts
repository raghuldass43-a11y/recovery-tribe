import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
