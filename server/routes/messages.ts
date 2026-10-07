import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.get('/', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);

export default router;
