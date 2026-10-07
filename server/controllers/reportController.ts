import type { Response } from 'express';
import { Report } from '../models/Report.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreReport } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Submit a content or user report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ message: 'Target type, target ID, and reason are required' });
      return;
    }

    if (isDbConnected()) {
      const report = await Report.create({
        reporter: req.user._id,
        reporterEmail: req.user.email,
        targetType,
        targetId,
        reason,
        details: details || '',
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for keeping RecoveryTribe safe. Our moderators will review this report promptly.',
        reportId: report._id,
      });
      return;
    }

    const reportId = '655000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
    const newReport: StoreReport = {
      _id: reportId,
      reporter: req.user._id.toString(),
      reporterEmail: req.user.email,
      targetType,
      targetId,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.reports.unshift(newReport);

    res.status(201).json({
      success: true,
      message: 'Thank you for keeping RecoveryTribe safe. Our moderators will review this report promptly.',
      reportId: newReport._id,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
