export type LanguageCode =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export type PostCategory = 'general' | 'milestone' | 'support' | 'gratitude' | 'challenge';

export type MainNavTab = 'home' | 'explore' | 'create' | 'messages' | 'profile';

export type RecoveryMood = 'Peaceful' | 'Grateful' | 'Strong' | 'Craving' | 'Vulnerable' | 'Hopeful';

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  emotion: string; // e.g. "Peaceful", "Grateful", "Hopeful"
  emotionIcon: string; // e.g. "🕊️", "🙏", "🌅"
  emotionColor?: string;
  oneWordFocus: string; // e.g. "Clarity", "Courage", "Presence"
  note?: string;
  timestamp: number;
}

export interface User {
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
  pledgedToday?: string; // date string YYYY-MM-DD
  groups?: string[];
  hideSobrietyDate?: boolean;
  todayReflection?: DailyReflection;
}

export interface PostComment {
  id: string;
  author: string;
  email: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  author: string;
  authorName: string;
  text: string;
  images: string[];
  timestamp: number;
  likedBy: string[];
  comments: PostComment[];
  savedBy: string[];
  challengePost?: boolean;
  category?: PostCategory;
  edited?: boolean;
  milestoneDay?: number;
  mood?: RecoveryMood | string;
  hashtags?: string[];
  isAnonymous?: boolean;
  privacy?: 'public' | 'tribe' | 'anonymous';
}

export interface Story {
  id: string;
  email: string;
  name: string;
  text: string;
  bg: string;
  timestamp: number;
  viewedBy: string[];
  milestone?: string;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'story_view' | 'milestone' | 'follow';
  actorName: string;
  actorEmail?: string;
  timestamp: number;
  read: boolean;
  postId?: string;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  authorName: string;
  to: string; // user email or 'community_circle'
  text: string;
  image?: string;
  timestamp: number;
  reaction?: string;
  read?: boolean;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  membersCount: number;
  category: string;
}

export interface CravingLog {
  id: string;
  userEmail: string;
  intensity: number; // 1-10
  trigger: string;
  notes: string;
  surfedMinutes: number;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userEmail: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  timestamp: number;
}

export interface PersonalGoal {
  id: string;
  title: string;
  targetDays: number;
  completed: boolean;
  notes?: string;
}

export interface DailyHabitItem {
  id: string;
  title: string;
  category: 'Physical' | 'Mental' | 'Spiritual' | 'Rest' | 'Custom';
  description: string;
  iconName: 'water' | 'meditation' | 'exercise' | 'literature' | 'gratitude' | 'sleep' | 'custom';
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  isDefault?: boolean;
}

export type HabitCompletionMap = Record<string, string[]>; // Date (YYYY-MM-DD) -> Array of completed habit IDs


