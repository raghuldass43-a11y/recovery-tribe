import { Router } from 'express';
import { getAdminStats, getAllUsers, getAllReports, updateReportStatus, deletePostByAdmin, toggleSuspendUser } from '../controllers/adminController.ts';
import { protect, adminOnly } from '../middleware/auth.ts';

const router = Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.get('/reports', getAllReports);
router.put('/reports/:id', updateReportStatus);
router.delete('/posts/:id', deletePostByAdmin);

export default router;
