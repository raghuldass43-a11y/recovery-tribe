import { Router } from 'express';
import { getFeed, createPost, updatePost, deletePost, likePost, savePost, sharePost } from '../controllers/postController.ts';
import { getComments, addComment } from '../controllers/commentController.ts';
import { protect, optionalAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', optionalAuth, getFeed);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/save', protect, savePost);
router.post('/:id/share', optionalAuth, sharePost);
router.get('/:id/comments', optionalAuth, getComments);
router.post('/:id/comments', protect, addComment);

export default router;
