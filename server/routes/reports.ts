import { Router } from 'express';
import { createReport } from '../controllers/reportController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, createReport);

export default router;
