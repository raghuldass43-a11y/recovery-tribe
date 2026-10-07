import type { Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreMessage } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Get all conversations for current user
// @route   GET /api/messages
// @access  Private
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email;

    if (isDbConnected()) {
      const messages = await Message.find({
        $or: [
          { sender: req.user._id },
          { recipient: currentUserId },
          { recipient: currentUserEmail },
          { recipient: 'community_circle' },
        ],
      }).sort({ createdAt: -1 });

      const convMap = new Map<string, { lastMessage: typeof messages[0]; unreadCount: number }>();

      for (const msg of messages) {
        let partnerId = '';
        if (msg.recipient === 'community_circle') {
          partnerId = 'community_circle';
        } else if (msg.sender.toString() === currentUserId) {
          partnerId = msg.recipient;
        } else {
          partnerId = msg.sender.toString();
        }

        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { lastMessage: msg, unreadCount: 0 });
        }

        if (!msg.isRead && (msg.recipient === currentUserId || msg.recipient === currentUserEmail)) {
          const item = convMap.get(partnerId);
          if (item) item.unreadCount += 1;
        }
      }

      const conversations = [];
      for (const [partnerId, data] of convMap.entries()) {
        if (partnerId === 'community_circle') {
          conversations.push({
            id: 'community_circle',
            name: 'Community Circle',
            email: 'community_circle',
            avatar: '',
            isCircle: true,
            lastMessage: data.lastMessage.text,
            lastSender: data.lastMessage.senderName,
            timestamp: new Date(data.lastMessage.createdAt).getTime(),
            unreadCount: data.unreadCount,
          });
        } else {
          let user = null;
          if (mongoose.Types.ObjectId.isValid(partnerId)) {
            user = await User.findById(partnerId).select('name email avatar');
          } else {
            user = await User.findOne({ email: partnerId.toLowerCase() }).select('name email avatar');
          }

          if (user) {
            conversations.push({
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              isCircle: false,
              lastMessage: data.lastMessage.text,
              lastSender: data.lastMessage.senderName,
              timestamp: new Date(data.lastMessage.createdAt).getTime(),
              unreadCount: data.unreadCount,
            });
          }
        }
      }

      res.status(200).json({ success: true, conversations });
      return;
    }

    // In-Memory store
    const userMsgs = memoryStore.messages.filter(m =>
      m.sender === currentUserId ||
      m.recipient === currentUserId ||
      m.recipient === currentUserEmail ||
      m.recipient === 'community_circle'
    );

    userMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const convMap = new Map<string, { lastMessage: StoreMessage; unreadCount: number }>();

    for (const msg of userMsgs) {
      let partnerId = '';
      if (msg.recipient === 'community_circle') {
        partnerId = 'community_circle';
      } else if (msg.sender === currentUserId) {
        partnerId = msg.recipient;
      } else {
        partnerId = msg.sender;
      }

      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, { lastMessage: msg, unreadCount: 0 });
      }

      if (!msg.isRead && (msg.recipient === currentUserId || msg.recipient === currentUserEmail)) {
        const item = convMap.get(partnerId);
        if (item) item.unreadCount += 1;
      }
    }

    const conversations = [];
    for (const [partnerId, data] of convMap.entries()) {
      if (partnerId === 'community_circle') {
        conversations.push({
          id: 'community_circle',
          name: 'Community Circle',
          email: 'community_circle',
          avatar: '',
          isCircle: true,
          lastMessage: data.lastMessage.text,
          lastSender: data.lastMessage.senderName,
          timestamp: new Date(data.lastMessage.createdAt).getTime(),
          unreadCount: data.unreadCount,
        });
      } else {
        const partner = memoryStore.users.find(u => u._id === partnerId || u.email.toLowerCase() === partnerId.toLowerCase());
        if (partner) {
          conversations.push({
            id: partner._id,
            name: partner.name,
            email: partner.email,
            avatar: partner.avatar,
            isCircle: false,
            lastMessage: data.lastMessage.text,
            lastSender: data.lastMessage.senderName,
            timestamp: new Date(data.lastMessage.createdAt).getTime(),
            unreadCount: data.unreadCount,
          });
        }
      }
    }

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get messages with specific user or community_circle
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email;

    if (isDbConnected()) {
      let query: Record<string, unknown> = {};

      if (userId === 'community_circle') {
        query = { recipient: 'community_circle' };
      } else {
        query = {
          $or: [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: currentUserId },
            { sender: req.user._id, recipient: currentUserEmail },
            { sender: userId, recipient: currentUserEmail },
          ],
        };
      }

      const messages = await Message.find(query).sort({ createdAt: 1 }).limit(100);

      if (userId !== 'community_circle') {
        await Message.updateMany(
          { recipient: { $in: [currentUserId, currentUserEmail] }, sender: userId, isRead: false },
          { isRead: true }
        );
      }

      const formatted = messages.map(m => ({
        _id: m._id,
        id: m._id.toString(),
        sender: m.sender.toString(),
        senderName: m.senderName,
        senderEmail: m.senderEmail,
        recipient: m.recipient,
        text: m.text,
        isRead: m.isRead,
        createdAt: m.createdAt,
        timestamp: new Date(m.createdAt).getTime(),
      }));

      res.status(200).json({ success: true, count: formatted.length, messages: formatted });
      return;
    }

    // In-Memory store
    let matchedMsgs: StoreMessage[] = [];
    if (userId === 'community_circle') {
      matchedMsgs = memoryStore.messages.filter(m => m.recipient === 'community_circle');
    } else {
      matchedMsgs = memoryStore.messages.filter(m =>
        (m.sender === currentUserId && (m.recipient === userId || m.recipient === currentUserEmail)) ||
        ((m.sender === userId || m.senderEmail === userId) && (m.recipient === currentUserId || m.recipient === currentUserEmail))
      );

      // Mark read
      matchedMsgs.forEach(m => {
        if (m.recipient === currentUserId || m.recipient === currentUserEmail) {
          m.isRead = true;
        }
      });
    }

    matchedMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const formatted = matchedMsgs.map(m => ({
      _id: m._id,
      id: m._id,
      sender: m.sender,
      senderName: m.senderName,
      senderEmail: m.senderEmail,
      recipient: m.recipient,
      text: m.text,
      isRead: m.isRead,
      createdAt: m.createdAt,
      timestamp: new Date(m.createdAt).getTime(),
    }));

    res.status(200).json({ success: true, count: formatted.length, messages: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Send a message to user or community_circle
// @route   POST /api/messages/:userId
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { userId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: 'Message text cannot be empty' });
      return;
    }

    const userBlocked = req.user.blocked || [];
    if (userBlocked.some((id: any) => id.toString() === userId)) {
      res.status(403).json({ message: 'Cannot message a blocked user' });
      return;
    }

    if (isDbConnected()) {
      const message = await Message.create({
        sender: req.user._id,
        senderName: req.user.name,
        senderEmail: req.user.email,
        recipient: userId,
        text: text.trim(),
      });

      if (userId !== 'community_circle') {
        let recipientUser = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
          recipientUser = await User.findById(userId);
        } else {
          recipientUser = await User.findOne({ email: userId.toLowerCase() });
        }

        if (recipientUser) {
          await Notification.create({
            recipient: recipientUser._id,
            recipientEmail: recipientUser.email,
            sender: req.user._id,
            senderName: req.user.name,
            type: 'message',
            title: 'Direct Message',
            message: `${req.user.name}: "${text.trim().slice(0, 50)}..."`,
            link: `/messages/${req.user._id}`,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: {
          _id: message._id,
          id: message._id.toString(),
          sender: message.sender.toString(),
          senderName: message.senderName,
          senderEmail: message.senderEmail,
          recipient: message.recipient,
          text: message.text,
          isRead: message.isRead,
          createdAt: message.createdAt,
          timestamp: new Date(message.createdAt).getTime(),
        },
      });
      return;
    }

    // In-Memory store
    const newMsgId = '653000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
    const newMsg: StoreMessage = {
      _id: newMsgId,
      sender: req.user._id.toString(),
      senderName: req.user.name,
      senderEmail: req.user.email,
      recipient: userId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.messages.push(newMsg);

    if (userId !== 'community_circle') {
      const recipientUser = memoryStore.users.find(u => u._id === userId || u.email.toLowerCase() === userId.toLowerCase());
      if (recipientUser) {
        memoryStore.notifications.push({
          _id: 'notif_' + Date.now(),
          recipient: recipientUser._id,
          recipientEmail: recipientUser.email,
          sender: req.user._id.toString(),
          senderName: req.user.name,
          type: 'message',
          title: 'Direct Message',
          message: `${req.user.name}: "${text.trim().slice(0, 50)}..."`,
          link: `/messages/${req.user._id}`,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: {
        _id: newMsg._id,
        id: newMsg._id,
        sender: newMsg.sender,
        senderName: newMsg.senderName,
        senderEmail: newMsg.senderEmail,
        recipient: newMsg.recipient,
        text: newMsg.text,
        isRead: newMsg.isRead,
        createdAt: newMsg.createdAt,
        timestamp: new Date(newMsg.createdAt).getTime(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
