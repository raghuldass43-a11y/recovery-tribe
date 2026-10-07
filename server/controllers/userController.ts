import type { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.ts';
import { Post } from '../models/Post.ts';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreUser } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

function calculateSobrietyDays(sobrietyDateStr?: string): number {
  if (!sobrietyDateStr) return 0;
  const start = new Date(sobrietyDateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// @desc    Get user profile by ID or email
// @route   GET /api/users/:id
// @access  Public
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let query: Record<string, unknown> = {};
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: id };
      } else {
        query = { email: id.toLowerCase() };
      }

      const user = await User.findOne(query).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const postsCount = await Post.countDocuments({ author: user._id });
      const sobrietyDays = calculateSobrietyDays(user.sobrietyDate);

      const isFollowing = req.user
        ? user.followers.some(fId => fId.toString() === req.user?._id.toString())
        : false;

      const isBlocked = req.user
        ? req.user.blocked?.some((bId: any) => bId.toString() === user._id.toString())
        : false;

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          sobrietyDate: user.sobrietyDate,
          sobrietyDays,
          role: user.role,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          postsCount,
          pledgedToday: user.pledgedToday,
          challengeStartDate: user.challengeStartDate,
          createdAt: user.createdAt,
          isFollowing,
          isBlocked,
        },
      });
      return;
    }

    // In-Memory store
    const memUser = memoryStore.users.find(u => u._id === id || u.email.toLowerCase() === id.toLowerCase());
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const postsCount = memoryStore.posts.filter(p => p.author === memUser._id || p.authorEmail === memUser.email).length;
    const sobrietyDays = calculateSobrietyDays(memUser.sobrietyDate);

    const isFollowing = req.user
      ? memUser.followers.includes(req.user._id.toString())
      : false;

    const isBlocked = req.user
      ? (req.user.blocked || []).includes(memUser._id)
      : false;

    res.status(200).json({
      success: true,
      user: {
        _id: memUser._id,
        name: memUser.name,
        username: memUser.username,
        email: memUser.email,
        bio: memUser.bio,
        avatar: memUser.avatar,
        sobrietyDate: memUser.sobrietyDate,
        sobrietyDays,
        role: memUser.role,
        followersCount: memUser.followers.length,
        followingCount: memUser.following.length,
        postsCount,
        pledgedToday: memUser.pledgedToday,
        challengeStartDate: memUser.challengeStartDate,
        createdAt: memUser.createdAt,
        isFollowing,
        isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, bio, avatar, sobrietyDate, pledgedToday } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (name) user.name = name.trim();
      if (typeof bio === 'string') user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (sobrietyDate) user.sobrietyDate = sobrietyDate;
      if (pledgedToday !== undefined) user.pledgedToday = pledgedToday;

      await user.save();

      if (name) {
        await Post.updateMany(
          { author: user._id },
          { authorName: user.name, authorAvatar: user.avatar }
        );
      }

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          sobrietyDate: user.sobrietyDate,
          sobrietyDays: calculateSobrietyDays(user.sobrietyDate),
          role: user.role,
          pledgedToday: user.pledgedToday,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
      });
      return;
    }

    // In-Memory store
    const memUser = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) memUser.name = name.trim();
    if (typeof bio === 'string') memUser.bio = bio;
    if (avatar !== undefined) memUser.avatar = avatar;
    if (sobrietyDate) memUser.sobrietyDate = sobrietyDate;
    if (pledgedToday !== undefined) memUser.pledgedToday = pledgedToday;
    memUser.updatedAt = new Date();

    if (name) {
      memoryStore.posts.forEach(p => {
        if (p.author === memUser._id || p.authorEmail === memUser.email) {
          p.authorName = memUser.name;
          p.authorAvatar = memUser.avatar;
        }
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: memUser._id,
        name: memUser.name,
        username: memUser.username,
        email: memUser.email,
        bio: memUser.bio,
        avatar: memUser.avatar,
        sobrietyDate: memUser.sobrietyDate,
        sobrietyDays: calculateSobrietyDays(memUser.sobrietyDate),
        role: memUser.role,
        pledgedToday: memUser.pledgedToday,
        followersCount: memUser.followers.length,
        followingCount: memUser.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    if (isDbConnected()) {
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const currentUser = await User.findById(req.user._id);
      if (!currentUser) return;

      const alreadyFollowing = currentUser.following.some(id => id.toString() === targetId);
      if (alreadyFollowing) {
        res.status(400).json({ message: 'Already following this user' });
        return;
      }

      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      await currentUser.save();
      await targetUser.save();

      await Notification.create({
        recipient: targetUser._id,
        recipientEmail: targetUser.email,
        sender: currentUser._id,
        senderName: currentUser.name,
        type: 'follow',
        title: 'New Tribe Follower',
        message: `${currentUser.name} started walking alongside you in RecoveryTribe.`,
      });

      res.status(200).json({
        success: true,
        message: `You are now following ${targetUser.name}`,
        followingCount: currentUser.following.length,
        targetFollowersCount: targetUser.followers.length,
      });
      return;
    }

    // In-memory
    const target = memoryStore.users.find(u => u._id === targetId || u.email === targetId);
    const me = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);

    if (!target || !me) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (me.following.includes(target._id)) {
      res.status(400).json({ message: 'Already following this user' });
      return;
    }

    me.following.push(target._id);
    target.followers.push(me._id);

    memoryStore.notifications.push({
      _id: 'notif_' + Date.now(),
      recipient: target._id,
      recipientEmail: target.email,
      sender: me._id,
      senderName: me.name,
      type: 'follow',
      title: 'New Tribe Follower',
      message: `${me.name} started walking alongside you in RecoveryTribe.`,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `You are now following ${target.name}`,
      followingCount: me.following.length,
      targetFollowersCount: target.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetId = req.params.id;

    if (isDbConnected()) {
      const targetUser = await User.findById(targetId);
      const currentUser = await User.findById(req.user._id);

      if (targetUser && currentUser) {
        currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
          success: true,
          message: `Unfollowed ${targetUser.name}`,
          followingCount: currentUser.following.length,
          targetFollowersCount: targetUser.followers.length,
        });
        return;
      }
    }

    const target = memoryStore.users.find(u => u._id === targetId || u.email === targetId);
    const me = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);

    if (target && me) {
      me.following = me.following.filter(id => id !== target._id);
      target.followers = target.followers.filter(id => id !== me._id);

      res.status(200).json({
        success: true,
        message: `Unfollowed ${target.name}`,
        followingCount: me.following.length,
        targetFollowersCount: target.followers.length,
      });
      return;
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Block a user
// @route   POST /api/users/:id/block
// @access  Private
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot block yourself' });
      return;
    }

    if (isDbConnected()) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) {
        if (!currentUser.blocked.some(id => id.toString() === targetId)) {
          currentUser.blocked.push(new mongoose.Types.ObjectId(targetId));
          currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
          currentUser.followers = currentUser.followers.filter(id => id.toString() !== targetId);
          await currentUser.save();
        }
        res.status(200).json({ success: true, message: 'User blocked successfully', blocked: currentUser.blocked });
        return;
      }
    }

    const me = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);
    if (me) {
      if (!me.blocked.includes(targetId)) {
        me.blocked.push(targetId);
        me.following = me.following.filter(id => id !== targetId);
        me.followers = me.followers.filter(id => id !== targetId);
      }
      res.status(200).json({ success: true, message: 'User blocked successfully', blocked: me.blocked });
      return;
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Unblock a user
// @route   DELETE /api/users/:id/block
// @access  Private
export const unblockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const targetId = req.params.id;

    if (isDbConnected()) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) {
        currentUser.blocked = currentUser.blocked.filter(id => id.toString() !== targetId);
        await currentUser.save();
        res.status(200).json({ success: true, message: 'User unblocked successfully', blocked: currentUser.blocked });
        return;
      }
    }

    const me = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);
    if (me) {
      me.blocked = me.blocked.filter(id => id !== targetId);
      res.status(200).json({ success: true, message: 'User unblocked successfully', blocked: me.blocked });
      return;
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get blocked users list
// @route   GET /api/users/blocked
// @access  Private
export const getBlockedUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const currentUser = await User.findById(req.user._id).populate('blocked', 'name email avatar username');
      res.status(200).json({ success: true, blocked: currentUser?.blocked || [] });
      return;
    }

    const me = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);
    const blockedList = (me?.blocked || []).map(bId => {
      const u = memoryStore.users.find(user => user._id === bId);
      return u ? { _id: u._id, name: u.name, email: u.email, avatar: u.avatar, username: u.username } : null;
    }).filter(Boolean);

    res.status(200).json({ success: true, blocked: blockedList });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Search users by name, username, or email
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      res.status(200).json({ success: true, users: [] });
      return;
    }

    const lower = q.trim().toLowerCase();

    if (isDbConnected()) {
      const regex = new RegExp(q.trim(), 'i');
      const users = await User.find({
        $or: [{ name: regex }, { username: regex }, { email: regex }],
        isSuspended: false,
      })
        .select('name username email avatar bio sobrietyDate followers')
        .limit(20);

      const mapped = users.map(u => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        sobrietyDays: calculateSobrietyDays(u.sobrietyDate),
        followersCount: u.followers.length,
      }));

      res.status(200).json({ success: true, users: mapped });
      return;
    }

    // In-Memory
    const matched = memoryStore.users
      .filter(u => !u.isSuspended && (u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower)))
      .slice(0, 20)
      .map(u => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        sobrietyDays: calculateSobrietyDays(u.sobrietyDate),
        followersCount: u.followers.length,
      }));

    res.status(200).json({ success: true, users: matched });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
