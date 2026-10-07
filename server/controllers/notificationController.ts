import type { Response } from 'express';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email;

    if (isDbConnected()) {
      const notifications = await Notification.find({
        $or: [{ recipient: req.user._id }, { recipientEmail: currentUserEmail }],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const formatted = notifications.map(n => ({
        _id: n._id,
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        senderName: n.senderName,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
        timestamp: new Date(n.createdAt).getTime(),
      }));

      const unreadCount = formatted.filter(n => !n.read).length;
      res.status(200).json({ success: true, unreadCount, notifications: formatted });
      return;
    }

    // In-Memory store
    const notifs = memoryStore.notifications.filter(n => n.recipient === currentUserId || n.recipientEmail === currentUserEmail);
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatted = notifs.map(n => ({
      _id: n._id,
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      senderName: n.senderName,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
      timestamp: new Date(n.createdAt).getTime(),
    }));

    const unreadCount = formatted.filter(n => !n.read).length;
    res.status(200).json({ success: true, unreadCount, notifications: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const notif = await Notification.findOneAndUpdate(
        { _id: req.params.id, $or: [{ recipient: req.user._id }, { recipientEmail: req.user.email }] },
        { read: true },
        { new: true }
      );

      if (!notif) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.status(200).json({ success: true, notification: notif });
      return;
    }

    const notif = memoryStore.notifications.find(n => n._id === req.params.id);
    if (notif) {
      notif.read = true;
      res.status(200).json({ success: true, notification: notif });
      return;
    }

    res.status(404).json({ message: 'Notification not found' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      await Notification.updateMany(
        { $or: [{ recipient: req.user._id }, { recipientEmail: req.user.email }], read: false },
        { read: true }
      );
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
      return;
    }

    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email;
    memoryStore.notifications.forEach(n => {
      if (n.recipient === currentUserId || n.recipientEmail === currentUserEmail) {
        n.read = true;
      }
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
