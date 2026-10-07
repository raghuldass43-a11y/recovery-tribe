import type { Response } from 'express';
import { User } from '../models/User.ts';
import { Post } from '../models/Post.ts';
import { Comment } from '../models/Comment.ts';
import { Report } from '../models/Report.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Get admin overview statistics
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const [totalUsers, totalPosts, totalReports, pendingReports] = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Report.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
      ]);

      res.status(200).json({
        success: true,
        stats: { totalUsers, totalPosts, totalReports, pendingReports },
      });
      return;
    }

    const totalUsers = memoryStore.users.length;
    const totalPosts = memoryStore.posts.length;
    const totalReports = memoryStore.reports.length;
    const pendingReports = memoryStore.reports.filter(r => r.status === 'pending').length;

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalPosts, totalReports, pendingReports },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get all users for admin review
// @route   GET /api/admin/users
// @access  Private (Admin Only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    if (isDbConnected()) {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments();
      res.status(200).json({ success: true, total, users });
      return;
    }

    const total = memoryStore.users.length;
    const users = memoryStore.users
      .slice((page - 1) * limit, page * limit)
      .map(({ password: _, ...rest }) => rest);

    res.status(200).json({ success: true, total, users });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get all reports for moderation
// @route   GET /api/admin/reports
// @access  Private (Admin Only)
export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;

    if (isDbConnected()) {
      const query: Record<string, unknown> = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const reports = await Report.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: reports.length, reports });
      return;
    }

    let reports = [...memoryStore.reports];
    if (status && status !== 'all') {
      reports = reports.filter(r => r.status === status);
    }
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin Only)
export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'dismissed', 'action_taken'].includes(status)) {
      res.status(400).json({ message: 'Invalid report status' });
      return;
    }

    if (isDbConnected()) {
      const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }
      res.status(200).json({ success: true, report });
      return;
    }

    const report = memoryStore.reports.find(r => r._id === req.params.id);
    if (report) {
      report.status = status;
      report.updatedAt = new Date();
      res.status(200).json({ success: true, report });
      return;
    }

    res.status(404).json({ message: 'Report not found' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete post by admin moderation
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin Only)
export const deletePostByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      await Comment.deleteMany({ post: req.params.id });
      res.status(200).json({ success: true, message: 'Post removed by administrator' });
      return;
    }

    const pIdx = memoryStore.posts.findIndex(p => p._id === req.params.id);
    if (pIdx === -1) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    memoryStore.posts.splice(pIdx, 1);
    memoryStore.comments = memoryStore.comments.filter(c => c.post !== req.params.id);

    res.status(200).json({ success: true, message: 'Post removed by administrator' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Suspend or unsuspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin Only)
export const toggleSuspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (user.role === 'admin') {
        res.status(400).json({ message: 'Cannot suspend administrator accounts' });
        return;
      }

      user.isSuspended = !user.isSuspended;
      await user.save();

      res.status(200).json({
        success: true,
        message: user.isSuspended ? 'User suspended' : 'User account restored',
        isSuspended: user.isSuspended,
      });
      return;
    }

    const user = memoryStore.users.find(u => u._id === req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ message: 'Cannot suspend administrator accounts' });
      return;
    }

    user.isSuspended = !user.isSuspended;
    user.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: user.isSuspended ? 'User suspended' : 'User account restored',
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
