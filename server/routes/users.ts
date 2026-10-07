import { Router } from 'express';
import { getProfile, updateProfile, followUser, unfollowUser, blockUser, unblockUser, getBlockedUsers, searchUsers } from '../controllers/userController.ts';
import { protect, optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/search', searchUsers);
router.get('/blocked', protect, getBlockedUsers);
router.put('/profile', protect, updateProfile);
router.get('/:id', optionalAuth, getProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.post('/:id/block', protect, blockUser);
router.delete('/:id/block', protect, unblockUser);

export default router;
