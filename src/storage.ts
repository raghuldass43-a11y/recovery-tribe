import { User, Post, Story, ChatMessage, DailyHabitItem, HabitCompletionMap, DailyReflection } from './types';

// Admin constants
export const ADMIN_EMAIL = "raghuldass43@gmail.com";

// In-memory cache fallback if both window.storage and localStorage fail
const memoryStore: Record<string, string> = {};

export async function getShared<T>(key: string, fallback: T): Promise<T> {
  // Try window.storage first (if running inside specialized environment)
  try {
    if (typeof window !== 'undefined' && (window as unknown as { storage?: { get: (k: string, s: boolean) => Promise<{ value: string } | null> } }).storage?.get) {
      const r = await (window as unknown as { storage: { get: (k: string, s: boolean) => Promise<{ value: string } | null> } }).storage.get(key, true);
      if (r?.value) return JSON.parse(r.value);
    }
  } catch {
    // continue to localStorage fallback
  }

  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const v = window.localStorage.getItem("rt_shared:" + key);
      if (v) return JSON.parse(v);
    }
  } catch {
    // continue
  }

  if (memoryStore["rt_shared:" + key]) {
    return JSON.parse(memoryStore["rt_shared:" + key]);
  }

  return fallback;
}

export async function setShared<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);

  // Try window.storage
  try {
    if (typeof window !== 'undefined' && (window as unknown as { storage?: { set: (k: string, v: string, s: boolean) => Promise<void> } }).storage?.set) {
      await (window as unknown as { storage: { set: (k: string, v: string, s: boolean) => Promise<void> } }).storage.set(key, serialized, true);
    }
  } catch {
    // continue
  }

  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem("rt_shared:" + key, serialized);
    }
  } catch {
    // continue
  }

  memoryStore["rt_shared:" + key] = serialized;
}

export async function getPersonal<T>(key: string, fallback: T): Promise<T> {
  try {
    if (typeof window !== 'undefined' && (window as unknown as { storage?: { get: (k: string, s: boolean) => Promise<{ value: string } | null> } }).storage?.get) {
      const r = await (window as unknown as { storage: { get: (k: string, s: boolean) => Promise<{ value: string } | null> } }).storage.get(key, false);
      if (r?.value) return JSON.parse(r.value);
    }
  } catch {
    // continue
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const v = window.localStorage.getItem("rt_personal:" + key);
      if (v) return JSON.parse(v);
    }
  } catch {
    // continue
  }

  if (memoryStore["rt_personal:" + key]) {
    return JSON.parse(memoryStore["rt_personal:" + key]);
  }

  return fallback;
}

export async function setPersonal<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);

  try {
    if (typeof window !== 'undefined' && (window as unknown as { storage?: { set: (k: string, v: string, s: boolean) => Promise<void> } }).storage?.set) {
      await (window as unknown as { storage: { set: (k: string, v: string, s: boolean) => Promise<void> } }).storage.set(key, serialized, false);
    }
  } catch {
    // continue
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem("rt_personal:" + key, serialized);
    }
  } catch {
    // continue
  }

  memoryStore["rt_personal:" + key] = serialized;
}

export async function delPersonal(key: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && (window as unknown as { storage?: { delete: (k: string, s: boolean) => Promise<void> } }).storage?.delete) {
      await (window as unknown as { storage: { delete: (k: string, s: boolean) => Promise<void> } }).storage.delete(key, false);
    }
  } catch {
    // continue
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem("rt_personal:" + key);
    }
  } catch {
    // continue
  }

  delete memoryStore["rt_personal:" + key];
}

export function hashPasswordSync(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // simple fallback
  }
  return hashPasswordSync(password);
}

// Synchronous default community data for instant 0ms first render
export function getSeedDataSync() {
  const adminHashed = hashPasswordSync("12qw34er");
  const memberHashed = hashPasswordSync("password123");
  const now = Date.now();
  const oneDay = 86400000;
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(now - 30 * oneDay).toISOString().slice(0, 10);
  const ninetyDaysAgo = new Date(now - 90 * oneDay).toISOString().slice(0, 10);

  const initialUsers: Record<string, User> = {
    [ADMIN_EMAIL]: {
      name: "Raghul Dass (Organizer)",
      email: ADMIN_EMAIL,
      password: adminHashed,
      bio: "Founder of RecoveryTribe 🌸 Host of the 100-Day Clean Journey. One day at a time, we walk this together.",
      sobrietyDate: new Date(now - 120 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: ["priya.k@tribe.org", "aarav.m@tribe.org", "harpreet.singh@tribe.org"],
      blocked: [],
      joinedAt: now - 120 * oneDay,
      location: "Bengaluru, India",
      pledgedToday: today,
    },
    "aarav.m@tribe.org": {
      name: "Aarav Mehta",
      email: "aarav.m@tribe.org",
      password: memberHashed,
      bio: "Day 30 warrior. Rebuilding my life, guitar player, morning walks are my therapy. 🎸🌅",
      sobrietyDate: thirtyDaysAgo,
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL, "priya.k@tribe.org"],
      blocked: [],
      joinedAt: now - 60 * oneDay,
      location: "Mumbai, India",
      pledgedToday: today,
    },
    "priya.k@tribe.org": {
      name: "Dr. Priya Kalyani",
      email: "priya.k@tribe.org",
      password: memberHashed,
      bio: "90 Days sober & serene. Chennai. Mental health advocate. Grateful for this safe space. 🙏✨",
      sobrietyDate: ninetyDaysAgo,
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL, "aarav.m@tribe.org"],
      blocked: [],
      joinedAt: now - 95 * oneDay,
      location: "Chennai, India",
      pledgedToday: today,
    },
    "harpreet.singh@tribe.org": {
      name: "Harpreet Singh",
      email: "harpreet.singh@tribe.org",
      password: memberHashed,
      bio: "Punjab. Chasing peace, not escapes. 15 days clean and counting with Waheguru's grace. 🕊️",
      sobrietyDate: new Date(now - 15 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      following: [ADMIN_EMAIL],
      blocked: [],
      joinedAt: now - 30 * oneDay,
      location: "Amritsar, India",
    },
  };

  const initialPosts: Post[] = [
    {
      id: "p_admin_24",
      author: ADMIN_EMAIL,
      authorName: "Raghul Dass (Organizer)",
      text: "🌅 Day 24 of our 100-Day Recovery Challenge! Today's reflection: When an urge whispers that 'just once won't hurt', pause, drink a tall glass of cold water, and take 5 deep belly breaths. We do not negotiate with cravings — we outbreathe them. How is everyone feeling today?",
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
      challengePost: true,
      category: "challenge",
      milestoneDay: 24,
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
    }
  ];

  const initialStories: Story[] = [
    {
      id: "s_admin",
      email: ADMIN_EMAIL,
      name: "Raghul Dass",
      text: "Breathe in peace, exhale tension. You are bigger than any craving today. 🌸",
      bg: "linear-gradient(135deg, #FF6B35, #C2185B)",
      timestamp: now - 5 * 3600 * 1000,
      viewedBy: ["aarav.m@tribe.org"],
    },
    {
      id: "s_priya",
      email: "priya.k@tribe.org",
      name: "Priya K",
      text: "Morning meditation by the beach. Sobriety gave me back my mornings! 🌅",
      bg: "linear-gradient(135deg, #2D6A4F, #52B788)",
      timestamp: now - 7 * 3600 * 1000,
      viewedBy: [],
    },
    {
      id: "s_aarav",
      email: "aarav.m@tribe.org",
      name: "Aarav M",
      text: "Day 30! Sending courage to anyone fighting silent battles today. 💪",
      bg: "linear-gradient(135deg, #3D5A80, #98C1D9)",
      timestamp: now - 11 * 3600 * 1000,
      viewedBy: [],
    }
  ];

  const initialChat: ChatMessage[] = [
    {
      id: "m_seed_1",
      author: "aarav.m@tribe.org",
      authorName: "Aarav Mehta",
      to: ADMIN_EMAIL,
      text: "Hey Raghul, thank you for organizing the 100-day challenge. Checking in every morning has really kept me accountable.",
      timestamp: now - 6 * 3600 * 1000,
    },
    {
      id: "m_seed_2",
      author: ADMIN_EMAIL,
      authorName: "Raghul Dass (Organizer)",
      to: "aarav.m@tribe.org",
      text: "You're doing fantastic Aarav! Reaching 30 days is a huge milestone. Keep taking it one sunrise at a time brother.",
      timestamp: now - 5 * 3600 * 1000,
    },
    {
      id: "m_seed_3",
      author: "priya.k@tribe.org",
      authorName: "Dr. Priya Kalyani",
      to: "community_circle",
      text: "Namaste everyone! Sending love and positive energy to all our warriors today. Remember Tele-MANAS (14416) is also free 24/7 if anyone feels overwhelmed.",
      timestamp: now - 4 * 3600 * 1000,
    }
  ];

  const challengeStartDate = new Date(now - 24 * oneDay).toISOString().slice(0, 10);

  return {
    initialUsers,
    initialPosts,
    initialStories,
    initialChat,
    challengeStartDate,
  };
}

// Seed initial vibrant community data if empty
export async function getInitialSeedData() {
  return getSeedDataSync();
}

export const DEFAULT_HABITS: DailyHabitItem[] = [
  {
    id: 'habit_meditation',
    title: 'Morning Meditation',
    category: 'Mental',
    description: '10-15 minutes of calm, breath-focused meditation or urge surfing',
    iconName: 'meditation',
    streak: 4,
    isDefault: true,
  },
  {
    id: 'habit_exercise',
    title: 'Exercise',
    category: 'Physical',
    description: '20-30 minutes of brisk walking, gym workout, yoga, or physical movement',
    iconName: 'exercise',
    streak: 3,
    isDefault: true,
  },
  {
    id: 'habit_literature',
    title: 'Read Recovery Literature',
    category: 'Spiritual',
    description: '10-15 pages of recovery literature, inspiring sober stories, or daily reflections',
    iconName: 'literature',
    streak: 5,
    isDefault: true,
  },
  {
    id: 'habit_water',
    title: 'Drink Water',
    category: 'Physical',
    description: 'Aim for 8 glasses or 2-3 liters to flush toxins and support mental clarity',
    iconName: 'water',
    streak: 3,
    isDefault: true,
  },
  {
    id: 'habit_gratitude',
    title: 'Gratitude Reflection',
    category: 'Spiritual',
    description: 'Acknowledge 3 things you are genuinely grateful for in your sober journey',
    iconName: 'gratitude',
    streak: 4,
    isDefault: true,
  },
  {
    id: 'habit_sleep',
    title: 'Rest & Recovery Sleep',
    category: 'Rest',
    description: 'Target 7-8 hours of peaceful, alcohol-free restorative sleep',
    iconName: 'sleep',
    streak: 3,
    isDefault: true,
  },
];

export async function getUserHabits(userEmail: string): Promise<DailyHabitItem[]> {
  return await getPersonal<DailyHabitItem[]>(`habits_${userEmail}`, DEFAULT_HABITS);
}

export async function saveUserHabits(userEmail: string, habits: DailyHabitItem[]): Promise<void> {
  await setPersonal(`habits_${userEmail}`, habits);
}

export async function getUserHabitLogs(userEmail: string): Promise<HabitCompletionMap> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const day3Ago = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

  return await getPersonal<HabitCompletionMap>(`habit_logs_${userEmail}`, {
    [day3Ago]: ['habit_meditation', 'habit_exercise', 'habit_water'],
    [dayBefore]: ['habit_meditation', 'habit_literature', 'habit_water'],
    [yesterday]: ['habit_meditation', 'habit_exercise', 'habit_literature', 'habit_water'],
    [todayStr]: ['habit_meditation', 'habit_water'],
  });
}

export async function saveUserHabitLogs(userEmail: string, logs: HabitCompletionMap): Promise<void> {
  await setPersonal(`habit_logs_${userEmail}`, logs);
}

export interface WeeklyStreakInfo {
  weeklyCompletedDaysCount: number; // e.g., 5/7 days
  currentConsecutiveStreak: number; // e.g., 4 days
  todayCompletedCount: number;
  totalHabitsCount: number;
  isTodayComplete: boolean;
  history7Days: Array<{ date: string; dayLabel: string; completedCount: number; isDone: boolean; isToday: boolean }>;
}

export function calculateWeeklyHabitStreak(
  logs: HabitCompletionMap,
  totalHabits: number = DEFAULT_HABITS.length
): WeeklyStreakInfo {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  let weeklyCompletedDaysCount = 0;
  const history7Days: WeeklyStreakInfo['history7Days'] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const completedList = logs[dStr] || [];
    const count = completedList.length;
    const isDone = count >= 1;
    if (isDone) weeklyCompletedDaysCount++;
    history7Days.push({
      date: dStr,
      dayLabel,
      completedCount: count,
      isDone,
      isToday: dStr === todayStr,
    });
  }

  const todayCount = (logs[todayStr] || []).length;
  const isTodayComplete = totalHabits > 0 && todayCount >= totalHabits;

  // Calculate current consecutive days streak ending today or yesterday
  let consecutiveStreak = 0;
  let checkOffset = todayCount > 0 ? 0 : 1;
  while (checkOffset <= 365) {
    const d = new Date();
    d.setDate(now.getDate() - checkOffset);
    const dStr = d.toISOString().slice(0, 10);
    const count = (logs[dStr] || []).length;
    if (count > 0) {
      consecutiveStreak++;
      checkOffset++;
    } else {
      break;
    }
  }

  return {
    weeklyCompletedDaysCount,
    currentConsecutiveStreak: consecutiveStreak,
    todayCompletedCount: todayCount,
    totalHabitsCount: totalHabits,
    isTodayComplete,
    history7Days,
  };
}

export const PRIMARY_EMOTIONS = [
  { id: 'peaceful', label: 'Peaceful', icon: '🕊️', color: 'from-sky-500 to-indigo-500', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300' },
  { id: 'grateful', label: 'Grateful', icon: '🙏', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300' },
  { id: 'hopeful', label: 'Hopeful', icon: '🌅', color: 'from-orange-500 to-rose-500', bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-300' },
  { id: 'strong', label: 'Strong', icon: '💪', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300' },
  { id: 'grounded', label: 'Grounded', icon: '🧘', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-300' },
  { id: 'joyful', label: 'Joyful', icon: '✨', color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-300' },
  { id: 'brave', label: 'Brave', icon: '🛡️', color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300' },
  { id: 'vulnerable', label: 'Vulnerable', icon: '🌱', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300' },
  { id: 'restless', label: 'Restless', icon: '🌊', color: 'from-blue-400 to-slate-500', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '🌧️', color: 'from-zinc-400 to-slate-600', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300' },
];

export const FOCUS_WORD_PRESETS = [
  'Clarity', 'Courage', 'Patience', 'Serenity', 'Breathe',
  'Presence', 'Healing', 'Discipline', 'Gratitude', 'Kindness',
  'Forgiveness', 'Faith', 'Strength', 'Peace', 'Honesty'
];

export async function getUserDailyReflection(userEmail: string): Promise<DailyReflection | null> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const fallback: DailyReflection = {
    date: todayStr,
    emotion: 'Peaceful',
    emotionIcon: '🕊️',
    emotionColor: 'from-sky-500 to-indigo-500',
    oneWordFocus: 'Clarity',
    timestamp: Date.now(),
  };

  const reflection = await getPersonal<DailyReflection | null>(`daily_reflection_${userEmail}`, fallback);
  return reflection;
}

export async function saveUserDailyReflection(userEmail: string, reflection: DailyReflection): Promise<void> {
  await setPersonal(`daily_reflection_${userEmail}`, reflection);
}


