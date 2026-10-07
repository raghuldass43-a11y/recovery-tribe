import type { Response } from 'express';
import { Challenge } from '../models/Challenge.ts';
import { User } from '../models/User.ts';
import { Post } from '../models/Post.ts';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreChallenge, type StorePost } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

function calculateChallengeDay(startDateStr: string): number {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(100, Math.max(1, diffDays));
}

// @desc    Get user's 100-Day Challenge progress
// @route   GET /api/challenge
// @access  Private
export const getChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      let challenge = await Challenge.findOne({ user: req.user._id });

      if (!challenge) {
        const today = new Date().toISOString().slice(0, 10);
        challenge = await Challenge.create({
          user: req.user._id,
          userEmail: req.user.email,
          startDate: req.user.challengeStartDate || today,
          completedDays: [1],
          progressPercent: 1,
        });
      }

      const currentDay = calculateChallengeDay(challenge.startDate);
      const progressPercent = Math.min(100, Math.round((challenge.completedDays.length / 100) * 100));

      res.status(200).json({
        success: true,
        challenge: {
          _id: challenge._id,
          startDate: challenge.startDate,
          currentDay,
          completedDays: challenge.completedDays,
          dailyLogs: challenge.dailyLogs,
          progressPercent,
          isCompleted: challenge.isCompleted || challenge.completedDays.length >= 100,
          totalCompletedDays: challenge.completedDays.length,
        },
      });
      return;
    }

    // In-Memory store
    const userId = req.user._id.toString();
    let challenge = memoryStore.challenges.find(c => c.user === userId || c.userEmail === req.user.email);

    if (!challenge) {
      const today = new Date().toISOString().slice(0, 10);
      challenge = {
        _id: '654000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0'),
        user: userId,
        userEmail: req.user.email,
        startDate: req.user.challengeStartDate || today,
        completedDays: [1],
        dailyLogs: [{ day: 1, checkInTime: new Date(), reflection: 'Journey started', urgeLevel: 0, mood: 'Determined' }],
        progressPercent: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.challenges.push(challenge);
    }

    const currentDay = calculateChallengeDay(challenge.startDate);
    const progressPercent = Math.min(100, Math.round((challenge.completedDays.length / 100) * 100));

    res.status(200).json({
      success: true,
      challenge: {
        _id: challenge._id,
        startDate: challenge.startDate,
        currentDay,
        completedDays: challenge.completedDays,
        dailyLogs: challenge.dailyLogs,
        progressPercent,
        isCompleted: challenge.isCompleted || challenge.completedDays.length >= 100,
        totalCompletedDays: challenge.completedDays.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Start / Reset 100-Day Challenge
// @route   POST /api/challenge/start
// @access  Private
export const startChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { startDate } = req.body;
    const dateToUse = startDate || new Date().toISOString().slice(0, 10);

    if (isDbConnected()) {
      let challenge = await Challenge.findOne({ user: req.user._id });

      if (challenge) {
        challenge.startDate = dateToUse;
        challenge.completedDays = [1];
        challenge.dailyLogs = [{ day: 1, checkInTime: new Date(), reflection: 'Clean Journey Started!', urgeLevel: 0, mood: 'Determined' }];
        challenge.progressPercent = 1;
        challenge.isCompleted = false;
        await challenge.save();
      } else {
        challenge = await Challenge.create({
          user: req.user._id,
          userEmail: req.user.email,
          startDate: dateToUse,
          completedDays: [1],
          dailyLogs: [{ day: 1, checkInTime: new Date(), reflection: 'Clean Journey Started!', urgeLevel: 0, mood: 'Determined' }],
          progressPercent: 1,
        });
      }

      await User.findByIdAndUpdate(req.user._id, { challengeStartDate: dateToUse });

      res.status(200).json({
        success: true,
        message: '100-Day Challenge commenced!',
        challenge: {
          _id: challenge._id,
          startDate: challenge.startDate,
          currentDay: 1,
          completedDays: challenge.completedDays,
          dailyLogs: challenge.dailyLogs,
          progressPercent: 1,
          isCompleted: false,
        },
      });
      return;
    }

    // In-Memory store
    const userId = req.user._id.toString();
    let challenge = memoryStore.challenges.find(c => c.user === userId || c.userEmail === req.user.email);

    if (challenge) {
      challenge.startDate = dateToUse;
      challenge.completedDays = [1];
      challenge.dailyLogs = [{ day: 1, checkInTime: new Date(), reflection: 'Clean Journey Started!', urgeLevel: 0, mood: 'Determined' }];
      challenge.progressPercent = 1;
      challenge.isCompleted = false;
      challenge.updatedAt = new Date();
    } else {
      challenge = {
        _id: '654000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0'),
        user: userId,
        userEmail: req.user.email,
        startDate: dateToUse,
        completedDays: [1],
        dailyLogs: [{ day: 1, checkInTime: new Date(), reflection: 'Clean Journey Started!', urgeLevel: 0, mood: 'Determined' }],
        progressPercent: 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.challenges.push(challenge);
    }

    const memUser = memoryStore.users.find(u => u._id === userId || u.email === req.user.email);
    if (memUser) memUser.challengeStartDate = dateToUse;

    res.status(200).json({
      success: true,
      message: '100-Day Challenge commenced!',
      challenge: {
        _id: challenge._id,
        startDate: challenge.startDate,
        currentDay: 1,
        completedDays: challenge.completedDays,
        dailyLogs: challenge.dailyLogs,
        progressPercent: 1,
        isCompleted: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Check-in / Record daily progress
// @route   POST /api/challenge/progress
// @access  Private
export const recordDailyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { day, reflection, urgeLevel, mood, shareToFeed } = req.body;

    if (isDbConnected()) {
      const challenge = await Challenge.findOne({ user: req.user._id });
      if (!challenge) {
        res.status(404).json({ message: 'Challenge not found. Please start challenge first.' });
        return;
      }

      const currentCalculatedDay = calculateChallengeDay(challenge.startDate);
      const dayToRecord = day || currentCalculatedDay;

      if (dayToRecord > 100) {
        res.status(400).json({ message: 'Challenge maximum is Day 100.' });
        return;
      }

      if (!challenge.completedDays.includes(dayToRecord)) {
        challenge.completedDays.push(dayToRecord);
        challenge.completedDays.sort((a, b) => a - b);
      }

      challenge.dailyLogs.push({
        day: dayToRecord,
        checkInTime: new Date(),
        reflection: reflection || 'Daily clean check-in completed.',
        urgeLevel: urgeLevel !== undefined ? urgeLevel : 0,
        mood: mood || 'Strong',
      });

      challenge.progressPercent = Math.min(100, Math.round((challenge.completedDays.length / 100) * 100));
      if (challenge.completedDays.length >= 100) {
        challenge.isCompleted = true;
      }

      await challenge.save();

      if (shareToFeed) {
        await Post.create({
          author: req.user._id,
          authorName: req.user.name,
          authorEmail: req.user.email,
          authorAvatar: req.user.avatar,
          text: `🔥 Day ${dayToRecord} Check-in Complete! ${reflection ? `"${reflection}"` : ''} One clean day at a time! 💪`,
          category: 'challenge',
          milestoneDay: dayToRecord,
          challengePost: true,
        });
      }

      res.status(200).json({
        success: true,
        message: `Day ${dayToRecord} check-in saved!`,
        challenge: {
          _id: challenge._id,
          startDate: challenge.startDate,
          currentDay: currentCalculatedDay,
          completedDays: challenge.completedDays,
          dailyLogs: challenge.dailyLogs,
          progressPercent: challenge.progressPercent,
          isCompleted: challenge.isCompleted,
        },
      });
      return;
    }

    // In-Memory store
    const userId = req.user._id.toString();
    const challenge = memoryStore.challenges.find(c => c.user === userId || c.userEmail === req.user.email);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found. Please start challenge first.' });
      return;
    }

    const currentCalculatedDay = calculateChallengeDay(challenge.startDate);
    const dayToRecord = day || currentCalculatedDay;

    if (dayToRecord > 100) {
      res.status(400).json({ message: 'Challenge maximum is Day 100.' });
      return;
    }

    if (!challenge.completedDays.includes(dayToRecord)) {
      challenge.completedDays.push(dayToRecord);
      challenge.completedDays.sort((a, b) => a - b);
    }

    challenge.dailyLogs.push({
      day: dayToRecord,
      checkInTime: new Date(),
      reflection: reflection || 'Daily clean check-in completed.',
      urgeLevel: urgeLevel !== undefined ? urgeLevel : 0,
      mood: mood || 'Strong',
    });

    challenge.progressPercent = Math.min(100, Math.round((challenge.completedDays.length / 100) * 100));
    if (challenge.completedDays.length >= 100) {
      challenge.isCompleted = true;
    }

    if (shareToFeed) {
      const newPostId = '651000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
      const newPost: StorePost = {
        _id: newPostId,
        author: req.user._id.toString(),
        authorName: req.user.name,
        authorEmail: req.user.email,
        authorAvatar: req.user.avatar || '',
        text: `🔥 Day ${dayToRecord} Check-in Complete! ${reflection ? `"${reflection}"` : ''} One clean day at a time! 💪`,
        images: [],
        category: 'challenge',
        milestoneDay: dayToRecord,
        likedBy: [],
        savedBy: [],
        shareCount: 0,
        isAnonymous: false,
        challengePost: true,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.posts.unshift(newPost);
    }

    res.status(200).json({
      success: true,
      message: `Day ${dayToRecord} check-in saved!`,
      challenge: {
        _id: challenge._id,
        startDate: challenge.startDate,
        currentDay: currentCalculatedDay,
        completedDays: challenge.completedDays,
        dailyLogs: challenge.dailyLogs,
        progressPercent: challenge.progressPercent,
        isCompleted: challenge.isCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
