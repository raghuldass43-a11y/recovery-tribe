import { Router } from 'express';
import { getChallenge, startChallenge, recordDailyProgress } from '../controllers/challengeController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.get('/', protect, getChallenge);
router.post('/start', protect, startChallenge);
router.post('/progress', protect, recordDailyProgress);

export default router;
