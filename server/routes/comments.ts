import { Router } from 'express';
import { deleteComment } from '../controllers/commentController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.delete('/:id', protect, deleteComment);

export default router;
