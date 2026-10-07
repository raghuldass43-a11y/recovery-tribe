import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { connectDB } from './server/config/db.ts';
import { seedInitialDatabase } from './server/config/seed.ts';
import authRoutes from './server/routes/auth.ts';
import userRoutes from './server/routes/users.ts';
import postRoutes from './server/routes/posts.ts';
import commentRoutes from './server/routes/comments.ts';
import messageRoutes from './server/routes/messages.ts';
import notificationRoutes from './server/routes/notifications.ts';
import challengeRoutes from './server/routes/challenge.ts';
import reportRoutes from './server/routes/reports.ts';
import adminRoutes from './server/routes/admin.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_EMAIL = "raghuldass43@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET || "recovery_tribe_secure_secret_2026";

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '15mb' }));

// Health Check Endpoints (for Cloud Run, container orchestration & monitoring)
app.get(['/health', '/api/health'], (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RecoveryTribe',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Mount Modular REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Helper: Deterministic / Secure Hash
function hashPassword(pass: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(pass).digest('hex');
}

function generateToken(payload: { email: string; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { email: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

// In-Memory Database store with initial rich recovery seeds
interface StoredUser {
  email: string;
  name: string;
  password?: string;
  bio?: string;
  avatar?: string;
  sobrietyDate?: string;
  challengeStartDate?: string | null;
  following: string[];
  blocked: string[];
  joinedAt: number;
  location?: string;
  pledgedToday?: string;
  groups?: string[];
  privacy?: {
    anonymousByDefault?: boolean;
    showSobrietyDate?: boolean;
  };
}

interface StoredPost {
  id: string;
  author: string;
  authorName: string;
  text: string;
  images: string[];
  timestamp: number;
  likedBy: string[];
  comments: Array<{
    id: string;
    author: string;
    email: string;
    text: string;
    timestamp: number;
  }>;
  savedBy: string[];
  category?: string;
  challengePost?: boolean;
  milestoneDay?: number;
  mood?: string;
  hashtags?: string[];
  isAnonymous?: boolean;
  privacy?: 'public' | 'tribe' | 'anonymous';
}

interface StoredStory {
  id: string;
  email: string;
  name: string;
  text: string;
  bg: string;
  timestamp: number;
  viewedBy: string[];
  milestone?: string;
}

interface StoredMessage {
  id: string;
  author: string;
  authorName: string;
  to: string;
  text: string;
  image?: string;
  timestamp: number;
  reaction?: string;
  read?: boolean;
}

interface StoredGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  membersCount: number;
  members: string[];
  category: string;
}

interface CravingLog {
  id: string;
  userEmail: string;
  intensity: number; // 1-10
  trigger: string;
  notes: string;
  surfedMinutes: number;
  timestamp: number;
}

interface JournalEntry {
  id: string;
  userEmail: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  timestamp: number;
}

const now = Date.now();
const oneDay = 86400000;
const todayStr = new Date().toISOString().slice(0, 10);

const db = {
  users: new Map<string, StoredUser>([
    [ADMIN_EMAIL, {
      name: "Raghul Dass (Organizer)",
      email: ADMIN_EMAIL,
      password: hashPassword("12qw34er"),
      bio: "Founder of RecoveryTribe 🌸 Host of the 100-Day Clean Journey. One day at a time, we walk this together.",
      sobrietyDate: new Date(now - 120 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: ["priya.k@tribe.org", "aarav.m@tribe.org", "harpreet.singh@tribe.org"],
      blocked: [],
      joinedAt: now - 120 * oneDay,
      location: "Bengaluru, India",
      pledgedToday: todayStr,
      groups: ["early_recovery", "mindful_sobriety", "100_day_warriors"],
    }],
    ["priya.k@tribe.org", {
      name: "Dr. Priya Kalyani",
      email: "priya.k@tribe.org",
      password: hashPassword("password123"),
      bio: "90 Days sober & serene. Chennai. Mental health advocate. Grateful for this safe space. 🙏✨",
      sobrietyDate: new Date(now - 90 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL, "aarav.m@tribe.org"],
      blocked: [],
      joinedAt: now - 95 * oneDay,
      location: "Chennai, India",
      pledgedToday: todayStr,
      groups: ["early_recovery", "mindful_sobriety"],
    }],
    ["aarav.m@tribe.org", {
      name: "Aarav Mehta",
      email: "aarav.m@tribe.org",
      password: hashPassword("password123"),
      bio: "Day 30 warrior. Rebuilding my life, guitar player, morning walks are my therapy. 🎸🌅",
      sobrietyDate: new Date(now - 30 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL, "priya.k@tribe.org"],
      blocked: [],
      joinedAt: now - 60 * oneDay,
      location: "Mumbai, India",
      pledgedToday: todayStr,
      groups: ["early_recovery", "100_day_warriors"],
    }],
    ["harpreet.singh@tribe.org", {
      name: "Harpreet Singh",
      email: "harpreet.singh@tribe.org",
      password: hashPassword("password123"),
      bio: "Punjab. Chasing peace, not escapes. 15 days clean and counting with Waheguru's grace. 🕊️",
      sobrietyDate: new Date(now - 15 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL],
      blocked: [],
      joinedAt: now - 30 * oneDay,
      location: "Amritsar, India",
      groups: ["early_recovery"],
    }],
  ]),
  posts: [
    {
      id: "p_admin_24",
      author: ADMIN_EMAIL,
      authorName: "Raghul Dass (Organizer)",
      text: "🌅 Day 24 of our 100-Day Recovery Challenge! Today's reflection: When an urge whispers that 'just once won't hurt', pause, drink a tall glass of cold water, and take 5 deep belly breaths. We do not negotiate with cravings — we outbreathe them. How is everyone feeling today? Drop your reflection in the comments!",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1000&q=80"
      ],
      timestamp: now - 3 * 3600 * 1000,
      likedBy: ["aarav.m@tribe.org", "priya.k@tribe.org", "harpreet.singh@tribe.org"],
      comments: [
        {
          id: "c1",
          author: "Dr. Priya Kalyani",
          email: "priya.k@tribe.org",
          text: "Woke up feeling anxious, but this reminded me to stay grounded. 5 deep breaths done. Thank you Raghul bhai! 🙏",
          timestamp: now - 2 * 3600 * 1000,
        },
        {
          id: "c2",
          author: "Aarav Mehta",
          email: "aarav.m@tribe.org",
          text: "Day 24 check-in strong! Heading for my evening jog now instead of old habits.",
          timestamp: now - 1 * 3600 * 1000,
        }
      ],
      savedBy: ["aarav.m@tribe.org"],
      category: "challenge",
      challengePost: true,
      milestoneDay: 24,
      mood: "Strong",
      hashtags: ["100DaysClean", "SoberLife", "UrgeSurfing"],
      privacy: 'public' as const,
    },
    {
      id: "p_priya_90",
      author: "priya.k@tribe.org",
      authorName: "Dr. Priya Kalyani",
      text: "🎉 Milestone unlocked: 90 DAYS CLEAN & SOBER! 🕊️ Three months ago I couldn't imagine getting through 24 hours without feeling lost. Today my mind is clear, my relationships are healing, and I woke up with genuine gratitude in my heart. If you're on Day 1 or Day 3, please keep going. The light at the end of the tunnel is real!",
      images: [
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=80"
      ],
      timestamp: now - 8 * 3600 * 1000,
      likedBy: [ADMIN_EMAIL, "aarav.m@tribe.org", "harpreet.singh@tribe.org"],
      comments: [
        {
          id: "c3",
          author: "Raghul Dass (Organizer)",
          email: ADMIN_EMAIL,
          text: "Priya, this is monumental!! So immensely proud of your strength and resilience. Keep shining! 🌟💐",
          timestamp: now - 7 * 3600 * 1000,
        }
      ],
      savedBy: [ADMIN_EMAIL],
      category: "milestone",
      milestoneDay: 90,
      mood: "Grateful",
      hashtags: ["Day90", "Milestone", "Serenity"],
      privacy: 'public' as const,
    },
    {
      id: "p_aarav_30",
      author: "aarav.m@tribe.org",
      authorName: "Aarav Mehta",
      text: "30 days chip reached today! My hands don't shake anymore when I play my acoustic guitar. Replacing chaos with melody. Gratitude to everyone in this tribe for holding space during my darkest evenings. 🙏",
      images: [
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80"
      ],
      timestamp: now - 22 * 3600 * 1000,
      likedBy: [ADMIN_EMAIL, "priya.k@tribe.org"],
      comments: [],
      savedBy: [],
      category: "gratitude",
      milestoneDay: 30,
      mood: "Hopeful",
      hashtags: ["Day30", "MusicTherapy", "Grateful"],
      privacy: 'public' as const,
    }
  ] as StoredPost[],
  stories: [
    {
      id: "s_admin",
      email: ADMIN_EMAIL,
      name: "Raghul Dass",
      text: "Breathe in peace, exhale tension. You are bigger than any craving today. 🌸",
      bg: "linear-gradient(135deg, #FF6B35, #C2185B)",
      timestamp: now - 5 * 3600 * 1000,
      viewedBy: ["aarav.m@tribe.org"],
      milestone: "Day 120",
    },
    {
      id: "s_priya",
      email: "priya.k@tribe.org",
      name: "Priya K",
      text: "Morning meditation by the beach. Sobriety gave me back my mornings! 🌅",
      bg: "linear-gradient(135deg, #2D6A4F, #52B788)",
      timestamp: now - 7 * 3600 * 1000,
      viewedBy: [],
      milestone: "Day 90",
    },
    {
      id: "s_aarav",
      email: "aarav.m@tribe.org",
      name: "Aarav M",
      text: "Day 30! Sending courage to anyone fighting silent battles today. 💪",
      bg: "linear-gradient(135deg, #3D5A80, #98C1D9)",
      timestamp: now - 11 * 3600 * 1000,
      viewedBy: [],
      milestone: "Day 30",
    }
  ] as StoredStory[],
  messages: [
    {
      id: "m_seed_1",
      author: "aarav.m@tribe.org",
      authorName: "Aarav Mehta",
      to: ADMIN_EMAIL,
      text: "Hey Raghul, thank you for organizing the 100-day challenge. Checking in every morning has really kept me accountable.",
      timestamp: now - 6 * 3600 * 1000,
      read: true,
    },
    {
      id: "m_seed_2",
      author: ADMIN_EMAIL,
      authorName: "Raghul Dass (Organizer)",
      to: "aarav.m@tribe.org",
      text: "You're doing fantastic Aarav! Reaching 30 days is a huge milestone. Keep taking it one sunrise at a time brother.",
      timestamp: now - 5 * 3600 * 1000,
      read: true,
    },
    {
      id: "m_seed_3",
      author: "priya.k@tribe.org",
      authorName: "Dr. Priya Kalyani",
      to: "community_circle",
      text: "Namaste everyone! Sending love and positive energy to all our warriors today. Remember Tele-MANAS (14416) is free 24/7 if anyone feels overwhelmed.",
      timestamp: now - 4 * 3600 * 1000,
      read: true,
    }
  ] as StoredMessage[],
  groups: [
    {
      id: "early_recovery",
      name: "Early Recovery (Days 1 - 30)",
      description: "A gentle, non-judgmental space for anyone taking their first courageous steps away from alcohol.",
      icon: "🌱",
      membersCount: 42,
      members: [ADMIN_EMAIL, "priya.k@tribe.org", "aarav.m@tribe.org", "harpreet.singh@tribe.org"],
      category: "Support",
    },
    {
      id: "100_day_warriors",
      name: "100-Day Clean Journey Tribe",
      description: "Dedicated daily check-ins, collective accountability, and stepping-stone prompts.",
      icon: "🔥",
      membersCount: 88,
      members: [ADMIN_EMAIL, "priya.k@tribe.org", "aarav.m@tribe.org"],
      category: "Challenge",
    },
    {
      id: "mindful_sobriety",
      name: "Mindful Sobriety & Meditation",
      description: "Urge surfing, breathwork, sleep hygiene, and holistic nervous system calming.",
      icon: "🧘",
      membersCount: 65,
      members: [ADMIN_EMAIL, "priya.k@tribe.org"],
      category: "Wellness",
    },
    {
      id: "night_owls",
      name: "Night Owls Craving Support",
      description: "Evening trigger check-ins for the hours when loneliness or cravings peak.",
      icon: "🌙",
      membersCount: 51,
      members: [ADMIN_EMAIL, "harpreet.singh@tribe.org"],
      category: "Cravings",
    }
  ] as StoredGroup[],
  cravings: [] as CravingLog[],
  journals: [] as JournalEntry[],
  reports: [] as Array<{ id: string; reporter: string; targetId: string; type: string; reason: string; timestamp: number }>,
};

// Auth Middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
  (req as unknown as { user: typeof user }).user = user;
  next();
};

/* =========================================================================
   REST APIS
   ========================================================================= */

// Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    mode: 'mobile-optimized',
    users: db.users.size,
    posts: db.posts.length,
    timestamp: Date.now(),
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, sobrietyDate, location, bio } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }
  const cleanEmail = String(email).trim().toLowerCase();
  if (db.users.has(cleanEmail)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser: StoredUser = {
    email: cleanEmail,
    name: String(name).trim(),
    password: hashPassword(password),
    bio: bio || "Walking the path of recovery 🌸",
    sobrietyDate: sobrietyDate || new Date().toISOString().slice(0, 10),
    challengeStartDate: null,
    following: [ADMIN_EMAIL],
    blocked: [],
    joinedAt: Date.now(),
    location: location || "",
    pledgedToday: "",
    groups: ["early_recovery"],
  };

  db.users.set(cleanEmail, newUser);
  const token = generateToken({ email: cleanEmail, name: newUser.name });
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ token, user: userSafe });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const existing = db.users.get(cleanEmail);

  if (!existing || existing.password !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({ email: cleanEmail, name: existing.name });
  const { password: _, ...userSafe } = existing;
  res.json({ token, user: userSafe });
});

// Current User Me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const user = db.users.get(authUser.email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update Profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const user = db.users.get(authUser.email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, bio, location, sobrietyDate, avatar } = req.body;
  if (name) user.name = String(name).trim();
  if (bio !== undefined) user.bio = String(bio).trim();
  if (location !== undefined) user.location = String(location).trim();
  if (sobrietyDate) user.sobrietyDate = sobrietyDate;
  if (avatar !== undefined) user.avatar = avatar;

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Posts List
app.get('/api/posts', (_req, res) => {
  res.json(db.posts);
});

// Create Post
app.post('/api/posts', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string; name: string } }).user;
  const { text, images, category, challengePost, milestoneDay, mood, hashtags, isAnonymous, privacy } = req.body;

  if (!text?.trim() && (!images || images.length === 0)) {
    res.status(400).json({ error: 'Post must contain text or image' });
    return;
  }

  const isActuallyAdmin = authUser.email === ADMIN_EMAIL;
  const finalChallenge = isActuallyAdmin && Boolean(challengePost);
  const finalCategory = (!isActuallyAdmin && category === 'challenge') ? 'general' : (category || 'general');

  const newPost: StoredPost = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    author: isAnonymous ? 'anonymous@tribe.org' : authUser.email,
    authorName: isAnonymous ? 'Anonymous Warrior 🕊️' : authUser.name,
    text: String(text || '').trim(),
    images: Array.isArray(images) ? images : [],
    timestamp: Date.now(),
    likedBy: [],
    comments: [],
    savedBy: [],
    category: finalCategory,
    challengePost: finalChallenge,
    milestoneDay: milestoneDay ? Number(milestoneDay) : undefined,
    mood: mood || undefined,
    hashtags: Array.isArray(hashtags) ? hashtags : [],
    isAnonymous: Boolean(isAnonymous),
    privacy: privacy || 'public',
  };

  db.posts.unshift(newPost);
  res.status(201).json(newPost);
});

// Like Post
app.post('/api/posts/:id/like', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const idx = post.likedBy.indexOf(authUser.email);
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
  } else {
    post.likedBy.push(authUser.email);
  }

  res.json({ liked: idx < 0, likesCount: post.likedBy.length, likedBy: post.likedBy });
});

// Save Post
app.post('/api/posts/:id/save', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const idx = post.savedBy.indexOf(authUser.email);
  if (idx >= 0) {
    post.savedBy.splice(idx, 1);
  } else {
    post.savedBy.push(authUser.email);
  }

  res.json({ saved: idx < 0, savedBy: post.savedBy });
});

// Add Comment
app.post('/api/posts/:id/comments', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string; name: string } }).user;
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400).json({ error: 'Comment text cannot be empty' });
    return;
  }

  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const newComment = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    author: authUser.name,
    email: authUser.email,
    text: String(text).trim(),
    timestamp: Date.now(),
  };

  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// Delete Post
app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx < 0) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const post = db.posts[idx];
  if (post.author !== authUser.email && authUser.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Permission denied' });
    return;
  }

  db.posts.splice(idx, 1);
  res.json({ success: true });
});

// Stories
app.get('/api/stories', (_req, res) => {
  const active = db.stories.filter(s => Date.now() - s.timestamp < 24 * 3600 * 1000);
  res.json(active);
});

app.post('/api/stories', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string; name: string } }).user;
  const { text, bg, milestone } = req.body;
  if (!text?.trim()) {
    res.status(400).json({ error: 'Story text required' });
    return;
  }

  const newStory: StoredStory = {
    id: 's_' + Date.now(),
    email: authUser.email,
    name: authUser.name,
    text: String(text).trim(),
    bg: bg || 'linear-gradient(135deg, #FF6B35, #C2185B)',
    timestamp: Date.now(),
    viewedBy: [],
    milestone: milestone || undefined,
  };

  db.stories.unshift(newStory);
  res.status(201).json(newStory);
});

app.post('/api/stories/:id/view', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const story = db.stories.find(s => s.id === req.params.id);
  if (story && !story.viewedBy.includes(authUser.email)) {
    story.viewedBy.push(authUser.email);
  }
  res.json({ success: true });
});

// Messages
app.get('/api/messages', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const userMessages = db.messages.filter(
    m => m.to === 'community_circle' || m.to === authUser.email || m.author === authUser.email
  );
  res.json(userMessages);
});

app.post('/api/messages', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string; name: string } }).user;
  const { to, text, image } = req.body;
  if (!to || (!text?.trim() && !image)) {
    res.status(400).json({ error: 'Recipient and content required' });
    return;
  }

  const newMsg: StoredMessage = {
    id: 'm_' + Date.now(),
    author: authUser.email,
    authorName: authUser.name,
    to,
    text: String(text || '').trim(),
    image: image || undefined,
    timestamp: Date.now(),
    read: false,
  };

  db.messages.push(newMsg);
  res.status(201).json(newMsg);
});

// Support Groups
app.get('/api/groups', (_req, res) => {
  res.json(db.groups);
});

app.post('/api/groups/:id/join', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const group = db.groups.find(g => g.id === req.params.id);
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  const idx = group.members.indexOf(authUser.email);
  if (idx >= 0) {
    group.members.splice(idx, 1);
    group.membersCount = Math.max(0, group.membersCount - 1);
  } else {
    group.members.push(authUser.email);
    group.membersCount += 1;
  }

  res.json({ joined: idx < 0, membersCount: group.membersCount });
});

// Recovery Check-in & Pledge
app.post('/api/recovery/pledge', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const user = db.users.get(authUser.email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  user.pledgedToday = new Date().toISOString().slice(0, 10);
  res.json({ pledged: true, date: user.pledgedToday });
});

// Craving Tracker Log
app.post('/api/recovery/cravings', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const { intensity, trigger, notes, surfedMinutes } = req.body;

  const log: CravingLog = {
    id: 'crav_' + Date.now(),
    userEmail: authUser.email,
    intensity: Number(intensity) || 5,
    trigger: String(trigger || 'General stress'),
    notes: String(notes || ''),
    surfedMinutes: Number(surfedMinutes) || 0,
    timestamp: Date.now(),
  };

  db.cravings.unshift(log);
  res.status(201).json(log);
});

// Private Journal Entries
app.get('/api/recovery/journal', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const userEntries = db.journals.filter(j => j.userEmail === authUser.email);
  res.json(userEntries);
});

app.post('/api/recovery/journal', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const { title, content, mood, tags } = req.body;

  const entry: JournalEntry = {
    id: 'jrn_' + Date.now(),
    userEmail: authUser.email,
    title: String(title || 'Recovery Reflection').trim(),
    content: String(content || '').trim(),
    mood: mood || 'Hopeful',
    tags: Array.isArray(tags) ? tags : [],
    timestamp: Date.now(),
  };

  db.journals.unshift(entry);
  res.status(201).json(entry);
});

// Reports & Moderation
app.post('/api/reports', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const { targetId, type, reason } = req.body;
  const report = {
    id: 'rep_' + Date.now(),
    reporter: authUser.email,
    targetId,
    type,
    reason: String(reason || 'Reported by user'),
    timestamp: Date.now(),
  };
  db.reports.push(report);
  res.json({ reported: true });
});

// Blocks
app.post('/api/blocks', authMiddleware, (req, res) => {
  const authUser = (req as unknown as { user: { email: string } }).user;
  const { targetEmail } = req.body;
  const user = db.users.get(authUser.email);
  if (!user || !targetEmail) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }
  if (!user.blocked.includes(targetEmail)) {
    user.blocked.push(targetEmail);
  }
  res.json({ blocked: true, blockedList: user.blocked });
});

// Translation Endpoint with multi-tier fallback (Gemini + MyMemory)
app.post('/api/translate', async (req, res) => {
  const { text, targetLang, sourceLang } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Text is required for translation' });
    return;
  }

  const target = String(targetLang || 'en').toLowerCase();
  const source = sourceLang ? String(sourceLang).toLowerCase() : 'autodetect';

  // Attempt 1: Gemini API when available
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({});
      const prompt = `You are a professional multilingual translator for a recovery community app. Translate the following text into the language with code '${target}'.\nRules:\n- Provide ONLY the translated text, with no quotes, explanations or extra text.\n- Preserve emojis and emotional warmth.\n\nText:\n${text}`;
      
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 4000)),
      ]);

      if (response && response.text && response.text.trim()) {
        res.json({
          translatedText: response.text.trim(),
          targetLang: target,
          provider: 'gemini',
        });
        return;
      }
    } catch {
      // Fall through to MyMemory
    }
  }

  // Attempt 2: MyMemory Translation API
  try {
    let detectedSource = source;
    if (detectedSource === 'autodetect') {
      if (/[\u0900-\u097F]/.test(text)) detectedSource = 'hi';
      else if (/[\u0B80-\u0BFF]/.test(text)) detectedSource = 'ta';
      else if (/[\u0C00-\u0C7F]/.test(text)) detectedSource = 'te';
      else if (/[\u0C80-\u0CFF]/.test(text)) detectedSource = 'kn';
      else if (/[\u0D00-\u0D7F]/.test(text)) detectedSource = 'ml';
      else if (/[\u0980-\u09FF]/.test(text)) detectedSource = 'bn';
      else if (/[\u0A80-\u0AFF]/.test(text)) detectedSource = 'gu';
      else if (/[\u0A00-\u0A7F]/.test(text)) detectedSource = 'pa';
      else if (/[\u0B00-\u0B7F]/.test(text)) detectedSource = 'or';
      else if (/[\u0600-\u06FF]/.test(text)) detectedSource = 'ur';
      else detectedSource = 'en';
    }

    // Ensure distinct pair
    const finalSource = detectedSource === target ? (target === 'en' ? 'hi' : 'en') : detectedSource;
    const pair = `${finalSource}|${target}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${pair}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(myMemoryUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = (await resp.json()) as { responseData?: { translatedText?: string } };
      if (data?.responseData?.translatedText && data.responseData.translatedText.trim()) {
        res.json({
          translatedText: data.responseData.translatedText.trim(),
          targetLang: target,
          provider: 'mymemory',
        });
        return;
      }
    }
  } catch {
    // fall through
  }

  res.status(200).json({
    translatedText: text,
    targetLang: target,
    provider: 'original',
  });
});

// Direct APK Download Endpoint for Android installation
app.get(['/download/RecoveryTribe.apk', '/download-apk', '/RecoveryTribe.apk', '/api/download/apk'], (_req, res) => {
  const candidatePaths = [
    path.resolve(process.cwd(), 'android/app/build/outputs/apk/release/RecoveryTribe.apk'),
    path.resolve(process.cwd(), 'dist-apk/RecoveryTribe.apk'),
    path.resolve(process.cwd(), 'RecoveryTribe.apk'),
    path.resolve(process.cwd(), 'public/RecoveryTribe.apk'),
  ];

  for (const apkFile of candidatePaths) {
    if (fs.existsSync(apkFile)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="RecoveryTribe.apk"');
      return res.sendFile(apkFile);
    }
  }
  res.status(404).json({ error: 'RecoveryTribe.apk not found on server.' });
});

/* =========================================================================
   VITE DEV SERVER MOUNTING
   ========================================================================= */

async function startServer() {
  // Initialize Database connection & seed data in background
  connectDB()
    .then(seedInitialDatabase)
    .catch((err) => {
      console.warn('[DB] Init non-fatal warning:', err);
    });

  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtml = path.resolve(distDir, 'index.html');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(indexHtml);

  if (isProduction) {
    console.log('Serving production static build from', distDir);
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/download')) {
        return next();
      }
      res.sendFile(indexHtml);
    });
  } else {
    console.log('Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Guaranteed SPA fallback for mobile browser refreshes & direct route access in dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/download')) {
        return next();
      }
      try {
        const rawIndex = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(url, rawIndex);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecoveryTribe Mobile Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught server exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled server rejection:', reason);
});

startServer();
