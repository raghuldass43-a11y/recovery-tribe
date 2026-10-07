import bcrypt from 'bcryptjs';
import { isDbConnected } from './db.ts';
import { User, type IUser } from '../models/User.ts';
import { Post, type IPost } from '../models/Post.ts';
import { Comment, type IComment } from '../models/Comment.ts';
import { Message, type IMessage } from '../models/Message.ts';
import { Notification, type INotification } from '../models/Notification.ts';
import { Challenge, type IChallenge } from '../models/Challenge.ts';
import { Report, type IReport } from '../models/Report.ts';

// In-Memory Fallback Records
export interface StoreUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string; // bcrypt hashed
  bio: string;
  avatar: string;
  sobrietyDate: string;
  role: 'user' | 'admin';
  followers: string[];
  following: string[];
  blocked: string[];
  pledgedToday?: string;
  challengeStartDate?: string;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorePost {
  _id: string;
  author: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  text: string;
  images: string[];
  category: 'general' | 'challenge' | 'milestone' | 'support' | 'gratitude';
  milestoneDay?: number;
  likedBy: string[];
  savedBy: string[];
  shareCount: number;
  isAnonymous: boolean;
  challengePost: boolean;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreComment {
  _id: string;
  post: string;
  author: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreMessage {
  _id: string;
  sender: string;
  senderName: string;
  senderEmail: string;
  recipient: string;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreNotification {
  _id: string;
  recipient: string;
  recipientEmail: string;
  sender?: string;
  senderName: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'challenge';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreChallenge {
  _id: string;
  user: string;
  userEmail: string;
  startDate: string;
  completedDays: number[];
  dailyLogs: Array<{
    day: number;
    checkInTime: Date;
    reflection?: string;
    urgeLevel?: number;
    mood?: string;
  }>;
  progressPercent: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreReport {
  _id: string;
  reporter: string;
  reporterEmail: string;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  users: StoreUser[] = [];
  posts: StorePost[] = [];
  comments: StoreComment[] = [];
  messages: StoreMessage[] = [];
  notifications: StoreNotification[] = [];
  challenges: StoreChallenge[] = [];
  reports: StoreReport[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const now = Date.now();
    const oneDay = 86400000;
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(now - 30 * oneDay).toISOString().slice(0, 10);
    const ninetyDaysAgo = new Date(now - 90 * oneDay).toISOString().slice(0, 10);
    const hundredTwentyDaysAgo = new Date(now - 120 * oneDay).toISOString().slice(0, 10);

    const salt = bcrypt.genSaltSync(10);
    const defaultHashedPassword = bcrypt.hashSync('password123', salt);

    const adminId = '650000000000000000000001';
    const priyaId = '650000000000000000000002';
    const aaravId = '650000000000000000000003';
    const harpreetId = '650000000000000000000004';

    this.users = [
      {
        _id: adminId,
        name: 'Raghul Dass (Organizer)',
        username: 'raghuldass',
        email: 'raghuldass43@gmail.com',
        password: defaultHashedPassword,
        bio: 'Founder of RecoveryTribe 🌸 Host of the 100-Day Clean Journey. One day at a time, we walk this together.',
        avatar: '',
        sobrietyDate: hundredTwentyDaysAgo,
        role: 'admin',
        followers: [priyaId, aaravId, harpreetId],
        following: [priyaId, aaravId, harpreetId],
        blocked: [],
        pledgedToday: today,
        challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
        isSuspended: false,
        createdAt: new Date(now - 120 * oneDay),
        updatedAt: new Date(),
      },
      {
        _id: priyaId,
        name: 'Dr. Priya Kalyani',
        username: 'priyakalyani',
        email: 'priya.k@tribe.org',
        password: defaultHashedPassword,
        bio: '90 Days sober & serene. Chennai. Mental health advocate. Grateful for this safe space. 🙏✨',
        avatar: '',
        sobrietyDate: ninetyDaysAgo,
        role: 'user',
        followers: [adminId, aaravId],
        following: [adminId, aaravId],
        blocked: [],
        pledgedToday: today,
        challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
        isSuspended: false,
        createdAt: new Date(now - 90 * oneDay),
        updatedAt: new Date(),
      },
      {
        _id: aaravId,
        name: 'Aarav Mehta',
        username: 'aaravm',
        email: 'aarav.m@tribe.org',
        password: defaultHashedPassword,
        bio: 'Day 30 warrior. Rebuilding my life, guitar player, morning walks are my therapy. 🎸🌅',
        avatar: '',
        sobrietyDate: thirtyDaysAgo,
        role: 'user',
        followers: [adminId, priyaId],
        following: [adminId, priyaId],
        blocked: [],
        pledgedToday: today,
        challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
        isSuspended: false,
        createdAt: new Date(now - 30 * oneDay),
        updatedAt: new Date(),
      },
      {
        _id: harpreetId,
        name: 'Harpreet Singh',
        username: 'harpreet_singh',
        email: 'harpreet.singh@tribe.org',
        password: defaultHashedPassword,
        bio: "Punjab. Chasing peace, not escapes. 15 days clean and counting with Waheguru's grace. 🕊️",
        avatar: '',
        sobrietyDate: new Date(now - 15 * oneDay).toISOString().slice(0, 10),
        role: 'user',
        followers: [adminId],
        following: [adminId],
        blocked: [],
        pledgedToday: today,
        challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
        isSuspended: false,
        createdAt: new Date(now - 15 * oneDay),
        updatedAt: new Date(),
      },
    ];

    const post1Id = '651000000000000000000001';
    const post2Id = '651000000000000000000002';
    const post3Id = '651000000000000000000003';

    this.posts = [
      {
        _id: post1Id,
        author: adminId,
        authorName: 'Raghul Dass (Organizer)',
        authorEmail: 'raghuldass43@gmail.com',
        authorAvatar: '',
        text: "🌅 Day 24 of our 100-Day Recovery Challenge! Today's reflection: When an urge whispers that 'just once won't hurt', pause, drink a tall glass of cold water, and take 5 deep belly breaths. We do not negotiate with cravings — we outbreathe them. How is everyone feeling today?",
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1000&q=80',
        ],
        category: 'challenge',
        milestoneDay: 24,
        likedBy: [priyaId, aaravId, harpreetId],
        savedBy: [aaravId],
        shareCount: 4,
        isAnonymous: false,
        challengePost: true,
        commentsCount: 2,
        createdAt: new Date(now - 3 * 3600 * 1000),
        updatedAt: new Date(now - 3 * 3600 * 1000),
      },
      {
        _id: post2Id,
        author: priyaId,
        authorName: 'Dr. Priya Kalyani',
        authorEmail: 'priya.k@tribe.org',
        authorAvatar: '',
        text: "🎉 Milestone unlocked: 90 DAYS CLEAN & SOBER! 🕊️ Three months ago I couldn't imagine getting through 24 hours without feeling lost. Today my mind is clear, my relationships are healing, and I woke up with genuine gratitude in my heart. If you're on Day 1 or Day 3, please keep going. The light at the end of the tunnel is real!",
        images: [
          'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=80',
        ],
        category: 'milestone',
        milestoneDay: 90,
        likedBy: [adminId, aaravId, harpreetId],
        savedBy: [adminId],
        shareCount: 12,
        isAnonymous: false,
        challengePost: false,
        commentsCount: 1,
        createdAt: new Date(now - 8 * 3600 * 1000),
        updatedAt: new Date(now - 8 * 3600 * 1000),
      },
      {
        _id: post3Id,
        author: aaravId,
        authorName: 'Aarav Mehta',
        authorEmail: 'aarav.m@tribe.org',
        authorAvatar: '',
        text: '30 days chip reached today! My hands don’t shake anymore when I play my acoustic guitar. Replacing chaos with melody. Gratitude to everyone in this tribe for holding space during my darkest evenings. 🙏',
        images: [
          'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
        ],
        category: 'gratitude',
        milestoneDay: 30,
        likedBy: [adminId, priyaId],
        savedBy: [],
        shareCount: 2,
        isAnonymous: false,
        challengePost: false,
        commentsCount: 0,
        createdAt: new Date(now - 22 * 3600 * 1000),
        updatedAt: new Date(now - 22 * 3600 * 1000),
      },
    ];

    this.comments = [
      {
        _id: '652000000000000000000001',
        post: post1Id,
        author: priyaId,
        authorName: 'Dr. Priya Kalyani',
        authorEmail: 'priya.k@tribe.org',
        authorAvatar: '',
        text: 'Woke up feeling anxious, but this reminded me to stay grounded. 5 deep breaths done. Thank you Raghul bhai! 🙏',
        createdAt: new Date(now - 2 * 3600 * 1000),
        updatedAt: new Date(now - 2 * 3600 * 1000),
      },
      {
        _id: '652000000000000000000002',
        post: post1Id,
        author: aaravId,
        authorName: 'Aarav Mehta',
        authorEmail: 'aarav.m@tribe.org',
        authorAvatar: '',
        text: 'Day 24 check-in strong! Heading for my evening jog now instead of old habits.',
        createdAt: new Date(now - 1 * 3600 * 1000),
        updatedAt: new Date(now - 1 * 3600 * 1000),
      },
      {
        _id: '652000000000000000000003',
        post: post2Id,
        author: adminId,
        authorName: 'Raghul Dass (Organizer)',
        authorEmail: 'raghuldass43@gmail.com',
        authorAvatar: '',
        text: 'Priya, this is monumental!! So immensely proud of your strength and resilience. Keep shining! 🌟💐',
        createdAt: new Date(now - 7 * 3600 * 1000),
        updatedAt: new Date(now - 7 * 3600 * 1000),
      },
    ];

    this.messages = [
      {
        _id: '653000000000000000000001',
        sender: adminId,
        senderName: 'Raghul Dass (Organizer)',
        senderEmail: 'raghuldass43@gmail.com',
        recipient: 'community_circle',
        text: "Welcome to today's Community Circle check-in! Share how you are feeling in one word or emoji. We hold space for everyone.",
        isRead: true,
        createdAt: new Date(now - 4 * 3600 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: '653000000000000000000002',
        sender: priyaId,
        senderName: 'Dr. Priya Kalyani',
        senderEmail: 'priya.k@tribe.org',
        recipient: 'community_circle',
        text: 'Peaceful 🧘 Woke up with a calm nervous system. Grateful for this safe space.',
        isRead: true,
        createdAt: new Date(now - 3 * 3600 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: '653000000000000000000003',
        sender: aaravId,
        senderName: 'Aarav Mehta',
        senderEmail: 'aarav.m@tribe.org',
        recipient: 'community_circle',
        text: 'Determined 💪 Going for Day 31 clean. If anyone feels an evening urge, remember we are all here together.',
        isRead: true,
        createdAt: new Date(now - 2 * 3600 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: '653000000000000000000004',
        sender: aaravId,
        senderName: 'Aarav Mehta',
        senderEmail: 'aarav.m@tribe.org',
        recipient: adminId,
        text: 'Hey Raghul, thank you for organizing the 100-day challenge. Checking in every morning has really kept me accountable.',
        isRead: true,
        createdAt: new Date(now - 6 * 3600 * 1000),
        updatedAt: new Date(),
      },
      {
        _id: '653000000000000000000005',
        sender: adminId,
        senderName: 'Raghul Dass (Organizer)',
        senderEmail: 'raghuldass43@gmail.com',
        recipient: aaravId,
        text: "You're doing fantastic Aarav! Reaching 30 days is a huge milestone. Keep taking it one sunrise at a time brother.",
        isRead: true,
        createdAt: new Date(now - 5 * 3600 * 1000),
        updatedAt: new Date(),
      },
    ];

    const completed24 = Array.from({ length: 24 }, (_, i) => i + 1);
    this.challenges = [
      {
        _id: '654000000000000000000001',
        user: adminId,
        userEmail: 'raghuldass43@gmail.com',
        startDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
        completedDays: completed24,
        dailyLogs: [{ day: 24, checkInTime: new Date(), reflection: 'Feeling grounded and grateful.', urgeLevel: 0, mood: 'Peaceful' }],
        progressPercent: 24,
        isCompleted: false,
        createdAt: new Date(now - 24 * oneDay),
        updatedAt: new Date(),
      },
    ];
  }
}

export const memoryStore = new MemoryStore();
