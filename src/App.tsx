import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, MessageCircle, Share2, Home, Search, PlusCircle, Bell,
  User, Globe, X, Edit3, LogOut, Send, Check, Bookmark, Grid3x3,
  Flame, LifeBuoy, Settings, Wind, Award, Sparkles, UserPlus,
  UserCheck, ShieldAlert, ArrowLeft, RefreshCw, MoreVertical,
  CheckCircle, HeartHandshake, Sun, Moon, RotateCcw, CheckCircle2
} from "lucide-react";
import confetti from "canvas-confetti";

import { LanguageCode, Post, Story, User as UserType, ChatMessage, PostCategory, NotificationItem, SupportGroup, DailyReflection } from "./types";
import { T, LANGS } from "./translations";
import {
  ADMIN_EMAIL,
  getShared,
  setShared,
  getPersonal,
  setPersonal,
  delPersonal,
  hashPassword,
  getInitialSeedData,
  getSeedDataSync,
  getUserHabitLogs,
  getUserHabits,
  calculateWeeklyHabitStreak,
  WeeklyStreakInfo,
  getUserDailyReflection,
  saveUserDailyReflection,
} from "./storage";
import { translatePost } from "./utils/translator";

import { UrgeSurfingModal } from "./components/UrgeSurfingModal";
import { MilestoneCertificateModal } from "./components/MilestoneCertificateModal";
import { CrisisModal } from "./components/CrisisModal";
import { SobrietyChallengeModal } from "./components/SobrietyChallengeModal";
import { CreatePostModal } from "./components/CreatePostModal";
import { ChatTab } from "./components/ChatTab";
import { StoryViewer } from "./components/StoryViewer";
import { FollowersModal } from "./components/FollowersModal";
import { SettingsModal } from "./components/SettingsModal";
import { ExploreTab } from "./components/ExploreTab";
import { RecoveryHubModal } from "./components/RecoveryHubModal";
import {
  initAndroidNativeFeatures,
  updateAndroidStatusBar,
  setupAndroidBackButton,
  triggerHaptic,
} from "./utils/androidBridge";

/* ---------------------------------------------------------------
   HELPERS
---------------------------------------------------------------- */
const AVATAR_COLORS = [
  "#EA580C", "#D97706", "#2563EB", "#059669", "#7C3AED", "#DB2777", "#DC2626"
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const start = new Date(y, m, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function getMilestoneTitle(days: number): string {
  if (days >= 365) return "1-Year Golden Chip";
  if (days >= 100) return "100-Day Century Master";
  if (days >= 90) return "90-Day Silver Serenity";
  if (days >= 60) return "60-Day Stability Chip";
  if (days >= 30) return "30-Day Bronze Serenity";
  if (days >= 14) return "14-Day Fortitude";
  if (days >= 7) return "7-Day Clarity";
  if (days >= 1) return "First Steps Clean";
  return "Day 1: First Step Clean";
}

function relTime(ts: number, t: typeof T.en): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t.justNow;
  if (min < 60) return `${min}${t.minAgo}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}${t.hourAgo}`;
  return `${Math.floor(hr / 24)}${t.dayAgo}`;
}

/* ---------------------------------------------------------------
   AVATAR COMPONENT
---------------------------------------------------------------- */
function Avatar({
  name,
  email,
  size = 40,
  ring = false,
  sentimentIcon,
}: {
  name?: string;
  email?: string;
  size?: number;
  ring?: boolean;
  sentimentIcon?: string;
}) {
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  const bg = hashColor(email || name || "x");

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`rounded-full flex items-center justify-center shrink-0 transition-transform ${
          ring ? "p-0.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-xs" : ""
        }`}
        style={{ width: size, height: size }}
      >
        <div
          className="w-full h-full rounded-full text-white font-extrabold flex items-center justify-center shadow-inner"
          style={{
            backgroundColor: bg,
            fontSize: size * 0.42,
            border: ring ? "2px solid white" : "none",
          }}
        >
          {initial}
        </div>
      </div>
      {sentimentIcon && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-2xs leading-none select-none z-10"
          style={{
            width: Math.max(16, Math.round(size * 0.38)),
            height: Math.max(16, Math.round(size * 0.38)),
            fontSize: Math.max(9, Math.round(size * 0.22)),
          }}
          title={`Today's Sentiment: ${sentimentIcon}`}
        >
          {sentimentIcon}
        </span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   TOAST COMPONENT
---------------------------------------------------------------- */
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-900 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold shadow-xl z-50 animate-bounce pointer-events-none border border-white/20">
      {msg}
    </div>
  );
}

/* ---------------------------------------------------------------
   MAIN APPLICATION
---------------------------------------------------------------- */
const initialSeed = getSeedDataSync();

export default function App() {
  const [screen, setScreen] = useState<"auth" | "main">("main");
  const [lang, setLang] = useState<LanguageCode>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // State data initialized synchronously from seed data for immediate 0ms render
  const [users, setUsers] = useState<Record<string, UserType>>(initialSeed.initialUsers);
  const [posts, setPosts] = useState<Post[]>(initialSeed.initialPosts);
  const [stories, setStories] = useState<Story[]>(initialSeed.initialStories);
  const [notifs, setNotifs] = useState<Record<string, NotificationItem[]>>({});
  const [currentUser, setCurrentUser] = useState<UserType | null>(initialSeed.initialUsers[ADMIN_EMAIL] || null);
  const [tab, setTab] = useState<"home" | "explore" | "messages" | "profile">("home");
  const [feedTab, setFeedTab] = useState<"forYou" | "following">("forYou");
  const [toast, setToast] = useState("");

  // Modals & views
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostCategory, setCreatePostCategory] = useState<PostCategory>("general");
  const [createPostDefaultChallenge, setCreatePostDefaultChallenge] = useState(false);
  const [postPrefill, setPostPrefill] = useState("");

  const [showAddStory, setShowAddStory] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);

  const [showLangModal, setShowLangModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showUrgeSurfing, setShowUrgeSurfing] = useState(false);
  const [showSobrietyModal, setShowSobrietyModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRecoveryHub, setShowRecoveryHub] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState<{ title: string; emails: string[] } | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const [groups, setGroups] = useState<SupportGroup[]>([
    {
      id: "early_recovery",
      name: "Early Recovery (Days 1 - 30)",
      description: "A gentle, non-judgmental space for anyone taking their first courageous steps away from alcohol.",
      icon: "🌱",
      membersCount: 42,
      category: "Support",
    },
    {
      id: "100_day_warriors",
      name: "100-Day Clean Journey Tribe",
      description: "Dedicated daily check-ins, collective accountability, and stepping-stone prompts.",
      icon: "🔥",
      membersCount: 88,
      category: "Challenge",
    },
    {
      id: "mindful_sobriety",
      name: "Mindful Sobriety & Breathwork",
      description: "Urge surfing, breathwork, sleep hygiene, and holistic nervous system calming.",
      icon: "🧘",
      membersCount: 65,
      category: "Wellness",
    },
    {
      id: "night_owls",
      name: "Night Owls Craving Support",
      description: "Evening trigger check-ins for the hours when loneliness or cravings peak.",
      icon: "🌙",
      membersCount: 51,
      category: "Cravings",
    }
  ]);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Challenge and chat state
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(initialSeed.challengeStartDate);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialSeed.initialChat);
  const [chatSeen, setChatSeen] = useState<Record<string, number>>({});

  // Translation cache: postId -> { [lang]: translatedText }
  const [translatedMap, setTranslatedMap] = useState<Record<string, Partial<Record<LanguageCode, string>>>>({});
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});
  const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);
  const [langSearchFilter, setLangSearchFilter] = useState<string>("");

  // Pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Daily Habits & Weekly Streak state
  const [habitStreak, setHabitStreak] = useState<WeeklyStreakInfo | null>(null);
  const [recoveryHubTab, setRecoveryHubTab] = useState<'overview' | 'reflection' | 'habits' | 'checkin' | 'cravings' | 'journal' | 'goals' | 'companion'>('overview');

  const refreshHabits = async () => {
    if (!currentUser) return;
    try {
      const [logs, habits] = await Promise.all([
        getUserHabitLogs(currentUser.email),
        getUserHabits(currentUser.email),
      ]);
      const streak = calculateWeeklyHabitStreak(logs, habits.length);
      setHabitStreak(streak);
    } catch (e) {
      console.warn("Failed to load habit streak", e);
    }
  };

  const refreshReflection = async () => {
    if (!currentUser?.email) return;
    try {
      const userEmail = currentUser.email;
      const reflection = await getUserDailyReflection(userEmail);
      if (reflection) {
        setCurrentUser(prev => {
          if (!prev) return null;
          if (JSON.stringify(prev.todayReflection) === JSON.stringify(reflection)) return prev;
          return { ...prev, todayReflection: reflection };
        });
        setUsers(prev => {
          const userObj = prev[userEmail];
          if (userObj && JSON.stringify(userObj.todayReflection) === JSON.stringify(reflection)) return prev;
          return {
            ...prev,
            [userEmail]: {
              ...(userObj || prev[userEmail]),
              todayReflection: reflection,
            },
          };
        });
      }
    } catch (e) {
      console.warn("Failed to load daily reflection", e);
    }
  };

  const handleReflectionSaved = async (reflection: DailyReflection) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, todayReflection: reflection };
    setCurrentUser(updatedUser);
    setUsers(prev => ({
      ...prev,
      [currentUser.email]: updatedUser,
    }));
    await saveUserDailyReflection(currentUser.email, reflection);
    flashToast(`Daily Reflection saved: ${reflection.emotionIcon} ${reflection.emotion} • "${reflection.oneWordFocus}"`);
  };

  useEffect(() => {
    if (currentUser?.email) {
      refreshHabits();
      refreshReflection();
    }
  }, [currentUser?.email]);

  const t = T[lang] || T.en;
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const flashToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  const lastBackPress = useRef<number>(0);

  // Sync theme with HTML root class & native Android status bar
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateAndroidStatusBar(theme);
  }, [theme]);

  // Android Native Features initialization
  useEffect(() => {
    initAndroidNativeFeatures(theme);
  }, []);

  // Android Hardware Back-Button navigation & modal dismissal
  useEffect(() => {
    return setupAndroidBackButton(() => {
      // 1. Close story viewer if open
      if (showStoryViewer) {
        setShowStoryViewer(false);
        return true;
      }
      // 2. Close any open dialog or modal
      if (showCreatePost) {
        setShowCreatePost(false);
        return true;
      }
      if (editingPost) {
        setEditingPost(null);
        return true;
      }
      if (showRecoveryHub) {
        setShowRecoveryHub(false);
        return true;
      }
      if (showSobrietyModal) {
        setShowSobrietyModal(false);
        return true;
      }
      if (showUrgeSurfing) {
        setShowUrgeSurfing(false);
        return true;
      }
      if (showCrisisModal) {
        setShowCrisisModal(false);
        return true;
      }
      if (showCertificateModal) {
        setShowCertificateModal(false);
        return true;
      }
      if (showSettingsModal) {
        setShowSettingsModal(false);
        return true;
      }
      if (showLangModal) {
        setShowLangModal(false);
        return true;
      }
      if (showFollowersModal) {
        setShowFollowersModal(null);
        return true;
      }
      if (showBlockedModal) {
        setShowBlockedModal(false);
        return true;
      }
      if (openCommentsPostId) {
        setOpenCommentsPostId(null);
        return true;
      }
      if (confirmDialog) {
        setConfirmDialog(null);
        return true;
      }
      if (editingProfile) {
        setEditingProfile(false);
        return true;
      }

      // 3. If on non-home tab, go back to Home
      if (tab !== "home") {
        setTab("home");
        triggerHaptic("light");
        return true;
      }

      // 4. Double-back to exit on home screen
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        return false; // Tells Capacitor to exitApp()
      }
      lastBackPress.current = now;
      flashToast("Press back again to exit Recovery Tribe");
      return true;
    });
  }, [
    showStoryViewer,
    showCreatePost,
    editingPost,
    showRecoveryHub,
    showSobrietyModal,
    showUrgeSurfing,
    showCrisisModal,
    showCertificateModal,
    showSettingsModal,
    showLangModal,
    showFollowersModal,
    showBlockedModal,
    openCommentsPostId,
    confirmDialog,
    editingProfile,
    tab,
  ]);

  // Background Storage Hydration & Session Restoration
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [u, p, s, chat, cStart, savedLang, savedTheme, session] = await Promise.all([
          getShared<Record<string, UserType>>("users", initialSeed.initialUsers),
          getShared<Post[]>("posts", initialSeed.initialPosts),
          getShared<Story[]>("stories", initialSeed.initialStories),
          getShared<ChatMessage[]>("chat", initialSeed.initialChat),
          getShared<string | null>("challengeStart", initialSeed.challengeStartDate),
          getPersonal<LanguageCode | null>("lang", null),
          getPersonal<"light" | "dark" | null>("theme", null),
          getPersonal<{ email: string } | null>("session", null),
        ]);

        if (!isMounted) return;

        if (u && Object.keys(u).length > 0) setUsers(u);
        if (p && p.length > 0) setPosts(p);
        if (s && s.length > 0) setStories(s);
        if (chat && chat.length > 0) setChatMessages(chat);
        if (cStart) setChallengeStartDate(cStart);
        if (savedLang) setLang(savedLang);
        if (savedTheme) setTheme(savedTheme);

        const activeEmail = session?.email && u && u[session.email] ? session.email : ADMIN_EMAIL;
        const activeUser = (u && u[activeEmail]) || initialSeed.initialUsers[ADMIN_EMAIL];
        if (activeUser && isMounted) {
          setCurrentUser({ ...activeUser, email: activeEmail });
          const userNotifs = await getShared<NotificationItem[]>("notif:" + activeEmail, []);
          if (isMounted) setNotifs(prev => ({ ...prev, [activeEmail]: userNotifs }));
          const seen = await getShared<Record<string, number>>("chatSeen:" + activeEmail, {});
          if (isMounted) setChatSeen(seen);
        }
      } catch (err) {
        console.warn("Storage hydration completed with in-memory store", err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Poll for background chat messages when messages tab is active
  useEffect(() => {
    if (tab !== "messages") return;
    const interval = setInterval(async () => {
      const freshChat = await getShared<ChatMessage[]>("chat", []);
      setChatMessages(freshChat);
    }, 4000);
    return () => clearInterval(interval);
  }, [tab]);

  // Storage persistence helpers
  const persistUsers = async (next: Record<string, UserType>) => {
    setUsers(next);
    await setShared("users", next);
  };

  const persistPosts = async (next: Post[]) => {
    setPosts(next);
    await setShared("posts", next);
  };

  const persistStories = async (next: Story[]) => {
    setStories(next);
    await setShared("stories", next);
  };

  const persistNotifs = async (email: string, list: NotificationItem[]) => {
    setNotifs(prev => ({ ...prev, [email]: list }));
    await setShared("notif:" + email, list);
  };

  const pushNotification = async (targetEmail: string, notif: Omit<NotificationItem, "id">) => {
    const existing = await getShared<NotificationItem[]>("notif:" + targetEmail, []);
    const updated: NotificationItem[] = [
      { id: "notif_" + Date.now() + Math.random().toString(36).slice(2, 5), ...notif },
      ...existing,
    ].slice(0, 50);
    await persistNotifs(targetEmail, updated);
  };

  const chooseLanguage = async (code: LanguageCode) => {
    setLang(code);
    await setPersonal("lang", code);
  };

  const toggleThemeMode = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await setPersonal("theme", next);
    flashToast(next === "dark" ? "🌙 Dark Mode activated" : "☀️ Light Mode activated");
  };

  // Auth Handlers
  const handleLogin = async (email: string, remember: boolean) => {
    const key = email.trim().toLowerCase();
    const userObj = users[key];
    if (!userObj) return;

    setCurrentUser({ ...userObj, email: key });
    if (remember) await setPersonal("session", { email: key });

    const userNotifs = await getShared<NotificationItem[]>("notif:" + key, []);
    setNotifs(prev => ({ ...prev, [key]: userNotifs }));
    const seen = await getShared<Record<string, number>>("chatSeen:" + key, {});
    setChatSeen(seen);

    setScreen("main");
    setTab("home");
  };

  const handleSignup = async (email: string, name: string, password: string, remember: boolean) => {
    const key = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);
    const today = new Date().toISOString().slice(0, 10);

    const newUser: UserType = {
      email: key,
      name: name.trim(),
      password: hashedPassword,
      bio: "",
      sobrietyDate: today,
      challengeStartDate: challengeStartDate || today,
      following: [ADMIN_EMAIL],
      blocked: [],
      joinedAt: Date.now(),
      pledgedToday: today,
    };

    const nextUsers = { ...users, [key]: newUser };
    await persistUsers(nextUsers);
    setCurrentUser(newUser);

    if (remember) await setPersonal("session", { email: key });
    await persistNotifs(key, []);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setScreen("main");
    setTab("home");
  };

  const handleLogout = async () => {
    await delPersonal("session");
    setCurrentUser(null);
    setScreen("auth");
  };

  // Profile Updates
  const saveProfile = async (name: string, bio: string, sobrietyDate: string) => {
    if (!currentUser) return;
    const updated: UserType = {
      ...users[currentUser.email],
      name: name.trim(),
      bio: bio.trim(),
      sobrietyDate,
    };
    const nextUsers = { ...users, [currentUser.email]: updated };
    await persistUsers(nextUsers);
    setCurrentUser(updated);
    setEditingProfile(false);
    flashToast("Profile updated successfully");
  };

  // Post Operations
  const handleCreatePost = async (
    text: string,
    images: string[],
    category: PostCategory,
    challengePost: boolean,
    meta?: {
      mood?: string;
      milestoneDay?: number;
      hashtags?: string[];
      isAnonymous?: boolean;
      privacy?: 'public' | 'tribe' | 'anonymous';
    }
  ) => {
    if (!currentUser) return;

    const isActuallyAdmin = currentUser.email === ADMIN_EMAIL;
    const isChallengePost = isActuallyAdmin && challengePost;
    const finalCategory = (!isActuallyAdmin && category === "challenge") ? "general" : category;

    const newPost: Post = {
      id: "p_" + Date.now(),
      author: meta?.isAnonymous ? "anonymous@tribe.org" : currentUser.email,
      authorName: meta?.isAnonymous ? "Anonymous Warrior 🕊️" : currentUser.name,
      text: text.trim(),
      images,
      timestamp: Date.now(),
      likedBy: [],
      comments: [],
      savedBy: [],
      category: finalCategory,
      challengePost: isChallengePost,
      mood: meta?.mood,
      milestoneDay: meta?.milestoneDay,
      hashtags: meta?.hashtags,
      isAnonymous: meta?.isAnonymous,
      privacy: meta?.privacy,
    };

    const nextPosts = [newPost, ...posts];
    await persistPosts(nextPosts);
    setShowCreatePost(false);
    setPostPrefill("");
    flashToast("Post shared with your tribe! 🕊️");

    if (challengePost || category === "milestone" || (meta?.milestoneDay && meta.milestoneDay > 0)) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleShareMilestoneToFeed = (days: number) => {
    if (!currentUser) return;
    const chipName = days >= 365 ? "1-Year Golden Chip" : days >= 100 ? "100-Day Century Master" : days >= 90 ? "90-Day Silver Serenity" : days >= 30 ? "30-Day Bronze Chip" : `${days} Days Clean`;
    const shareText = `🎉 CELEBRATING MILESTONE: ${days} DAYS ALCOHOL-FREE! 🕊️\n\nI just claimed my ${chipName}. One sunrise at a time, we rebuild our lives, our minds, and our peace. Deepest gratitude to everyone in this tribe walking this road together. If you're on Day 1, keep breathing — freedom is real! #Milestone #SoberLife #100DaysClean`;
    handleCreatePost(shareText, [], "milestone", false, {
      mood: "Grateful",
      milestoneDay: days,
      hashtags: ["#Milestone", "#SoberLife", "#100DaysClean"],
      privacy: 'public',
    });
  };

  const handlePledgeToday = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...currentUser, pledgedToday: today };
    const nextUsers = { ...users, [currentUser.email]: updated };
    await persistUsers(nextUsers);
    setCurrentUser(updated);
    flashToast("🕊️ Pledged clean for today! Stay strong.");
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    const currentGroups = currentUser.groups || [];
    const isMember = currentGroups.includes(groupId);
    const nextGroups = isMember ? currentGroups.filter(g => g !== groupId) : [...currentGroups, groupId];
    const updated = { ...currentUser, groups: nextGroups };
    const nextUsers = { ...users, [currentUser.email]: updated };
    await persistUsers(nextUsers);
    setCurrentUser(updated);

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, membersCount: isMember ? Math.max(0, g.membersCount - 1) : g.membersCount + 1 };
      }
      return g;
    }));
    flashToast(isMember ? "Left support group" : "Joined support group! 🌸");
  };

  const handleReportUser = (email: string) => {
    flashToast("Report received. Our moderation team has been notified. 🛡️");
  };

  const handleUpdatePost = async (postId: string, text: string, images: string[]) => {
    const nextPosts = posts.map(p =>
      p.id === postId ? { ...p, text: text.trim(), images, edited: true } : p
    );
    await persistPosts(nextPosts);
    setEditingPost(null);
    flashToast("Post edited");
  };

  const handleDeletePost = (post: Post) => {
    setConfirmDialog({
      message: t.deleteConfirm,
      confirmLabel: t.deleteBtn,
      danger: true,
      onConfirm: async () => {
        const nextPosts = posts.filter(p => p.id !== post.id);
        await persistPosts(nextPosts);
        setConfirmDialog(null);
        flashToast("Post deleted");
      },
    });
  };

  const handleToggleLike = async (post: Post) => {
    if (!currentUser) return;
    const wasLiked = post.likedBy.includes(currentUser.email);
    const nextLikedBy = wasLiked
      ? post.likedBy.filter(e => e !== currentUser.email)
      : [...post.likedBy, currentUser.email];

    const nextPosts = posts.map(p =>
      p.id === post.id ? { ...p, likedBy: nextLikedBy } : p
    );
    await persistPosts(nextPosts);

    if (!wasLiked && post.author !== currentUser.email) {
      await pushNotification(post.author, {
        type: "like",
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        timestamp: Date.now(),
        read: false,
        postId: post.id,
      });
    }
  };

  const handleToggleSave = async (post: Post) => {
    if (!currentUser) return;
    const wasSaved = (post.savedBy || []).includes(currentUser.email);
    const nextSavedBy = wasSaved
      ? post.savedBy.filter(e => e !== currentUser.email)
      : [...(post.savedBy || []), currentUser.email];

    const nextPosts = posts.map(p =>
      p.id === post.id ? { ...p, savedBy: nextSavedBy } : p
    );
    await persistPosts(nextPosts);
    flashToast(wasSaved ? "Removed from bookmarks" : "Saved to bookmarks");
  };

  const handleAddComment = async (post: Post, commentText: string) => {
    if (!currentUser || !commentText.trim()) return;
    const newComment = {
      id: "c_" + Date.now(),
      author: currentUser.name,
      email: currentUser.email,
      text: commentText.trim(),
      timestamp: Date.now(),
    };

    const nextPosts = posts.map(p =>
      p.id === post.id ? { ...p, comments: [...p.comments, newComment] } : p
    );
    await persistPosts(nextPosts);

    if (post.author !== currentUser.email) {
      await pushNotification(post.author, {
        type: "comment",
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        timestamp: Date.now(),
        read: false,
        postId: post.id,
        detail: commentText.trim(),
      });
    }
  };

  const handleTranslatePost = async (post: Post) => {
    const cachedTranslation = translatedMap[post.id]?.[lang];
    const isShowingOriginal = Boolean(showOriginalMap[post.id]);

    // If already translated for this current language, toggle between translated and original
    if (cachedTranslation) {
      setShowOriginalMap(prev => ({
        ...prev,
        [post.id]: !isShowingOriginal,
      }));
      return;
    }

    // Otherwise, translate it to current user language
    setTranslatingPostId(post.id);
    try {
      const translated = await translatePost(post.text, lang);
      setTranslatedMap(prev => ({
        ...prev,
        [post.id]: {
          ...(prev[post.id] || {}),
          [lang]: translated,
        },
      }));
      setShowOriginalMap(prev => ({
        ...prev,
        [post.id]: false,
      }));
      const langName = LANGS.find(l => l.code === lang)?.native || lang.toUpperCase();
      flashToast(`Translated to ${langName}`);
    } catch {
      flashToast(t.translateFailed || "Translation failed. Try again.");
    } finally {
      setTranslatingPostId(null);
    }
  };

  // Follow / Unfollow
  const handleToggleFollow = async (targetEmail: string) => {
    if (!currentUser) return;
    const following = currentUser.following || [];
    const isFollowing = following.includes(targetEmail);
    const nextFollowing = isFollowing
      ? following.filter(e => e !== targetEmail)
      : [...following, targetEmail];

    const updatedUser = { ...currentUser, following: nextFollowing };
    const nextUsers = { ...users, [currentUser.email]: updatedUser };
    await persistUsers(nextUsers);
    setCurrentUser(updatedUser);

    if (!isFollowing) {
      await pushNotification(targetEmail, {
        type: "follow",
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        timestamp: Date.now(),
        read: false,
      });
      flashToast("Following peer");
    }
  };

  // Block / Report
  const handleBlockUser = (targetEmail: string) => {
    if (!currentUser) return;
    setConfirmDialog({
      message: t.blockConfirm,
      confirmLabel: t.block,
      danger: true,
      onConfirm: async () => {
        const blocked = currentUser.blocked || [];
        const nextBlocked = [...blocked, targetEmail];
        const updatedUser = { ...currentUser, blocked: nextBlocked };
        const nextUsers = { ...users, [currentUser.email]: updatedUser };
        await persistUsers(nextUsers);
        setCurrentUser(updatedUser);
        setConfirmDialog(null);
        flashToast(t.blockedToast);
      },
    });
  };

  const handleUnblockUser = async (targetEmail: string) => {
    if (!currentUser) return;
    const blocked = currentUser.blocked || [];
    const nextBlocked = blocked.filter(e => e !== targetEmail);
    const updatedUser = { ...currentUser, blocked: nextBlocked };
    const nextUsers = { ...users, [currentUser.email]: updatedUser };
    await persistUsers(nextUsers);
    setCurrentUser(updatedUser);
    flashToast("User unblocked");
  };

  const handleReportPost = (post: Post) => {
    setConfirmDialog({
      message: t.reportConfirm,
      confirmLabel: t.report,
      onConfirm: async () => {
        const reports = await getShared<Array<{ id: string; reporter: string; post: string }>>("reports", []);
        await setShared("reports", [...reports, { id: "r_" + Date.now(), reporter: currentUser?.email || "", post: post.id }]);
        setConfirmDialog(null);
        flashToast(t.reportedToast);
      },
    });
  };

  // Stories
  const handleAddStory = async (text: string, bg: string) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: "s_" + Date.now(),
      email: currentUser.email,
      name: currentUser.name,
      text: text.trim(),
      bg,
      timestamp: Date.now(),
      viewedBy: [],
    };
    const nextStories = [newStory, ...stories];
    await persistStories(nextStories);
    setShowAddStory(false);
    flashToast("Story posted!");
  };

  const handleViewStory = (story: Story) => {
    const idx = activeStories.findIndex(s => s.id === story.id);
    setStoryViewerIndex(idx >= 0 ? idx : 0);
    setShowStoryViewer(true);
  };

  const handleStoryViewed = useCallback((storyId: string) => {
    if (!currentUser?.email) return;
    const userEmail = currentUser.email;
    setStories(prev => {
      const story = prev.find(s => s.id === storyId);
      if (!story || story.email === userEmail || story.viewedBy.includes(userEmail)) {
        return prev;
      }
      const nextStories = prev.map(s =>
        s.id === storyId ? { ...s, viewedBy: [...s.viewedBy, userEmail] } : s
      );
      setShared("stories", nextStories).catch(() => {});
      return nextStories;
    });
  }, [currentUser?.email]);

  // Chat Actions
  const handleSendMessage = async (to: string, messageText: string, image?: string) => {
    if (!currentUser || (!messageText.trim() && !image)) return;
    const newMsg: ChatMessage = {
      id: "m_" + Date.now() + Math.random().toString(36).slice(2, 5),
      author: currentUser.email,
      authorName: currentUser.name,
      to,
      text: messageText.trim(),
      image,
      timestamp: Date.now(),
    };
    const freshChat = await getShared<ChatMessage[]>("chat", []);
    const nextChat = [...freshChat, newMsg].slice(-800);
    setChatMessages(nextChat);
    await setShared("chat", nextChat);

    setChatSeen(prev => {
      const next = { ...prev, [to]: Date.now() };
      setShared("chatSeen:" + currentUser.email, next);
      return next;
    });
  };

  const handleMarkChatSeen = useCallback((peer: string) => {
    if (!currentUser?.email) return;
    const userEmail = currentUser.email;
    setChatSeen(prev => {
      if (prev[peer] && Date.now() - prev[peer] < 1500) {
        return prev;
      }
      const next = { ...prev, [peer]: Date.now() };
      setShared("chatSeen:" + userEmail, next).catch(() => {});
      return next;
    });
  }, [currentUser?.email]);

  // 100 Day Challenge Launch
  const handleStartChallenge = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await setShared("challengeStart", today);
    setChallengeStartDate(today);
    flashToast("100-Day Challenge Launched! 🏆");
  };

  // Daily Pledge
  const handleTakePledge = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...currentUser, pledgedToday: today };
    const nextUsers = { ...users, [currentUser.email]: updated };
    await persistUsers(nextUsers);
    setCurrentUser(updated);
    flashToast(t.pledgedSuccess);
  };

  // Reset Demo Data
  const handleResetData = async () => {
    const seed = await getInitialSeedData();
    await setShared("users", seed.initialUsers);
    await setShared("posts", seed.initialPosts);
    await setShared("stories", seed.initialStories);
    await setShared("chat", seed.initialChat);
    await setShared("challengeStart", seed.challengeStartDate);
    setUsers(seed.initialUsers);
    setPosts(seed.initialPosts);
    setStories(seed.initialStories);
    setChatMessages(seed.initialChat);
    setChallengeStartDate(seed.challengeStartDate);
    setShowSettingsModal(false);
    flashToast("Sample tribe data reloaded");
  };

  // Refresh feed
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const [p, s, u] = await Promise.all([
      getShared<Post[]>("posts", []),
      getShared<Story[]>("stories", []),
      getShared<Record<string, UserType>>("users", {}),
    ]);
    setPosts(p);
    setStories(s);
    setUsers(u);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  /* -------------------------------------------------------------
     RENDER SCREENS: AUTH (when explicitly logged out)
  -------------------------------------------------------------- */
  if (screen === "auth") {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center p-6 max-w-md mx-auto relative transition-colors duration-200">
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <button
            onClick={() => setShowLangModal(true)}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Change Language"
          >
            <Globe size={18} />
          </button>
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-amber-400 shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-zinc-600" />}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 mx-auto flex items-center justify-center text-white shadow-lg mb-3">
            <Flame size={32} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{t.appName}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.tagline}</p>
        </div>

        <AuthBox
          t={t}
          users={users}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (!currentUser) {
                const defaultUser = users[ADMIN_EMAIL] || initialSeed.initialUsers[ADMIN_EMAIL];
                setCurrentUser(defaultUser);
              }
              setScreen("main");
              setTab("home");
            }}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer py-2 px-4"
          >
            ← Explore as Guest / Back to Feed
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     MAIN APP SCREEN (Feed, Search, Chat, Alerts, Profile)
  -------------------------------------------------------------- */
  const blockedSet = new Set(currentUser?.blocked || []);
  const followingSet = new Set(currentUser?.following || []);

  const visiblePosts = posts.filter(
    p => !blockedSet.has(p.author) && !p.challengePost
  );

  const feedPosts = feedTab === "following"
    ? visiblePosts.filter(p => followingSet.has(p.author) || p.author === currentUser?.email)
    : visiblePosts;

  const userSobrietyDays = currentUser ? daysSince(currentUser.sobrietyDate) : 0;
  const myNotifs = currentUser ? notifs[currentUser.email] || [] : [];
  const unreadNotifsCount = myNotifs.filter(n => !n.read).length;

  const hasUnreadChats = chatMessages.some(
    m => m.to === currentUser?.email && m.timestamp > (chatSeen[m.author] || 0)
  );

  const activeStories = stories.filter(
    s => !blockedSet.has(s.email) && Date.now() - s.timestamp < 24 * 3600 * 1000
  );

  const myStories = activeStories.filter(s => s.email === currentUser?.email);
  const otherStories = activeStories.filter(s => s.email !== currentUser?.email);

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col w-full max-w-md mx-auto shadow-2xl relative transition-colors duration-200"
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      {/* TOP MODERN ANDROID APPBAR */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Flame size={18} className="fill-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
            Recovery<span className="text-orange-500">Tribe</span>
          </span>
        </div>

        {/* Clean Actions: Language, Notifications & Profile Quick Action */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher */}
          <button
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition active:scale-95 cursor-pointer"
            title="Language"
            aria-label="Change Language"
          >
            <Globe size={13} className="text-orange-500 shrink-0" />
            <span className="text-[11px] font-bold">
              {LANGS.find(l => l.code === lang)?.native || lang.toUpperCase()}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotifs(true)}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative transition active:scale-95 cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>

          {/* Profile Quick Avatar */}
          <button
            onClick={() => setTab("profile")}
            className="p-0.5 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700 hover:ring-orange-400 transition cursor-pointer"
            title="My Profile"
          >
            <Avatar name={currentUser?.name} email={currentUser?.email} size={30} />
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* HOME FEED TAB */}
        {tab === "home" && (
          <div>
            {/* 24h Stories Reel - Modern Horizontal Tray */}
            <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {/* My story */}
              <div
                onClick={() => (myStories.length > 0 ? handleViewStory(myStories[0]) : setShowAddStory(true))}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <Avatar
                    name={currentUser?.name}
                    email={currentUser?.email}
                    size={48}
                    ring={myStories.length > 0}
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddStory(true);
                    }}
                    className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-orange-500 border-2 border-white dark:border-zinc-900 text-white flex items-center justify-center text-[10px] font-black shadow-xs leading-none"
                  >
                    +
                  </div>
                </div>
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 max-w-[54px] truncate">
                  {t.yourStory}
                </span>
              </div>

              {/* Peers stories */}
              {otherStories.map(story => (
                <div
                  key={story.id}
                  onClick={() => handleViewStory(story)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <Avatar
                    name={story.name}
                    email={story.email}
                    size={48}
                    ring={!story.viewedBy.includes(currentUser?.email || "")}
                  />
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 max-w-[54px] truncate">
                    {story.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* HERO BANNER: Your recovery. Your community. Your journey. */}
            <div className="mx-3.5 mt-3 mb-1 p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black tracking-tight drop-shadow-xs flex items-center gap-1.5">
                    <span>🌱 RecoveryTribe</span>
                  </h1>
                  <p className="text-xs text-white/95 font-medium mt-0.5">
                    Your recovery. Your community. Your journey.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-extrabold text-white border border-white/25 shrink-0">
                  {userSobrietyDays}d Clean
                </div>
              </div>
            </div>

            {/* COMPACT RECOVERY & 100-DAY PROGRESS CARD */}
            {currentUser && (
              <div className="mx-3.5 my-2.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between">
                  {/* Left: Dynamic Days Clean & Chip */}
                  <div
                    onClick={() => setShowRecoveryHub(true)}
                    className="flex items-center gap-2.5 cursor-pointer group min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Flame size={20} className="fill-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
                          {userSobrietyDays} {t.daysCleanSuffix}
                        </span>
                        {currentUser.todayReflection?.emotionIcon && (
                          <span className="text-xs" title={`Emotion: ${currentUser.todayReflection.emotion}`}>
                            {currentUser.todayReflection.emotionIcon}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 truncate">
                        <span>{getMilestoneTitle(userSobrietyDays)}</span>
                        <span>·</span>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold group-hover:underline">
                          Tools Suite →
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Compact 100-Day Challenge Pill & SOS */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button
                      onClick={() => setShowSobrietyModal(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>100-Day</span>
                    </button>
                    <button
                      onClick={() => setShowCrisisModal(true)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                      title="Emergency Helpline (24/7)"
                    >
                      <LifeBuoy size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub-row: Quick 7-Day Habit Streak & One-tap checkin if not pledged */}
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <div
                    onClick={() => {
                      setRecoveryHubTab('habits');
                      setShowRecoveryHub(true);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {habitStreak ? `${habitStreak.todayCompletedCount}/${habitStreak.totalHabitsCount} Habits` : 'Daily Habits'}
                    </span>
                    {habitStreak && habitStreak.currentConsecutiveStreak > 0 && (
                      <span className="text-[10px] text-zinc-400">
                        ({habitStreak.currentConsecutiveStreak}d streak)
                      </span>
                    )}
                  </div>

                  {currentUser.pledgedToday === new Date().toISOString().slice(0, 10) ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={12} strokeWidth={3} />
                      <span>Pledged Today</span>
                    </span>
                  ) : (
                    <button
                      onClick={handlePledgeToday}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      + Take 24h Pledge
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Feed Tabs: Community vs Following */}
            <div className="flex items-center justify-between px-3.5 my-2">
              <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
                <button
                  onClick={() => setFeedTab("forYou")}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    feedTab === "forYou"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.forYouTab}
                </button>
                <button
                  onClick={() => setFeedTab("following")}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    feedTab === "following"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.followingTab} ({followingSet.size})
                </button>
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full transition cursor-pointer"
                title="Refresh Feed"
              >
                <RefreshCw size={15} className={isRefreshing ? "animate-spin text-orange-500" : ""} />
              </button>
            </div>

            {/* Feed Posts List */}
            <div className="space-y-4 px-3 py-2">
              {feedPosts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-zinc-800 text-orange-500 mx-auto flex items-center justify-center mb-3">
                    <HeartHandshake size={24} />
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-800 dark:text-zinc-200 mb-1">
                    {feedTab === "following" ? t.noFollowingPosts : t.noPostsYet}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
                    {feedTab === "following" ? t.noFollowingPostsSub : t.noPostsSub}
                  </p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="py-2.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t.postBtn}
                  </button>
                </div>
              ) : (
                feedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser!}
                    t={t}
                    lang={lang}
                    isFollowing={followingSet.has(post.author)}
                    authorSentimentIcon={users[post.author]?.todayReflection?.emotionIcon}
                    authorDaysClean={users[post.author]?.sobrietyDate ? daysSince(users[post.author]?.sobrietyDate) : (post.milestoneDay || 0)}
                    translatedText={translatedMap[post.id]?.[lang]}
                    isShowingOriginal={Boolean(showOriginalMap[post.id])}
                    isTranslating={translatingPostId === post.id}
                    showComments={openCommentsPostId === post.id}
                    onToggleComments={() =>
                      setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)
                    }
                    onLike={() => handleToggleLike(post)}
                    onSave={() => handleToggleSave(post)}
                    onAddComment={txt => handleAddComment(post, txt)}
                    onToggleFollow={() => handleToggleFollow(post.author)}
                    onTranslate={() => handleTranslatePost(post)}
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => handleDeletePost(post)}
                    onReport={() => handleReportPost(post)}
                    onBlock={() => handleBlockUser(post.author)}
                    onShare={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`https://recoverytribe.app/p/${post.id}`);
                        flashToast(t.linkCopied);
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* EXPLORE TAB */}
        {tab === "explore" && currentUser && (
          <ExploreTab
            t={t}
            currentUser={currentUser}
            users={users}
            posts={visiblePosts}
            groups={groups}
            onToggleFollow={handleToggleFollow}
            onJoinGroup={handleJoinGroup}
            onSelectHashtag={tag => setSearchQ(tag)}
            onOpen100DayHub={() => setShowSobrietyModal(true)}
            onOpenUrgeSurfing={() => setShowUrgeSurfing(true)}
            onOpenCrisis={() => setShowCrisisModal(true)}
            onOpenPostComments={postId => setOpenCommentsPostId(postId)}
          />
        )}

        {/* MESSAGES TAB */}
        {tab === "messages" && currentUser && (
          <ChatTab
            t={t}
            currentUser={currentUser}
            users={users}
            messages={chatMessages}
            chatSeen={chatSeen}
            onSend={handleSendMessage}
            onMarkSeen={handleMarkChatSeen}
            onBlockUser={handleBlockUser}
            onReportUser={handleReportUser}
          />
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && currentUser && (
          <ProfileView
            t={t}
            currentUser={currentUser}
            users={users}
            posts={posts}
            groups={groups}
            editing={editingProfile}
            onEdit={() => setEditingProfile(true)}
            onCancel={() => setEditingProfile(false)}
            onSave={saveProfile}
            onLogout={handleLogout}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenCertificate={() => setShowCertificateModal(true)}
            onOpenRecoveryHub={() => setShowRecoveryHub(true)}
            onJoinGroup={handleJoinGroup}
            onShowFollowersList={mode => {
              if (mode === "followers") {
                const followerEmails = Object.entries(users)
                  .filter(([_, u]) => (u.following || []).includes(currentUser.email))
                  .map(([email]) => email);
                setShowFollowersModal({ title: t.followersLabel, emails: followerEmails });
              } else {
                setShowFollowersModal({ title: t.followingTab, emails: currentUser.following || [] });
              }
            }}
            onToggleSave={handleToggleSave}
            onLikePost={handleToggleLike}
            onDeletePost={handleDeletePost}
            onEditPost={post => setEditingPost(post)}
            onShareMilestone={handleShareMilestoneToFeed}
            onOpenReflection={() => {
              setRecoveryHubTab('reflection');
              setShowRecoveryHub(true);
            }}
          />
        )}
      </main>

      {/* NATIVE 5-TAB BOTTOM NAVIGATION DOCK */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-around z-30 shadow-2xl pb-safe">
        {/* 🏠 Home */}
        <button
          onClick={() => setTab("home")}
          className={`flex flex-col items-center gap-1 transition cursor-pointer min-w-12 py-1 ${
            tab === "home" ? "text-orange-600 dark:text-orange-400 font-extrabold" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Home size={22} strokeWidth={tab === "home" ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* 🔍 Explore */}
        <button
          onClick={() => setTab("explore")}
          className={`flex flex-col items-center gap-1 transition cursor-pointer min-w-12 py-1 ${
            tab === "explore" ? "text-orange-600 dark:text-orange-400 font-extrabold" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Search size={22} strokeWidth={tab === "explore" ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Explore</span>
        </button>

        {/* ➕ Create Center Floating Button */}
        <button
          onClick={() => {
            setCreatePostCategory("general");
            setCreatePostDefaultChallenge(false);
            setShowCreatePost(true);
          }}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/35 hover:scale-105 active:scale-90 transition cursor-pointer"
          title="Create Recovery Post"
        >
          <PlusCircle size={28} />
        </button>

        {/* 💬 Messages */}
        <button
          onClick={() => setTab("messages")}
          className={`flex flex-col items-center gap-1 transition relative cursor-pointer min-w-12 py-1 ${
            tab === "messages" ? "text-orange-600 dark:text-orange-400 font-extrabold" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <MessageCircle size={22} strokeWidth={tab === "messages" ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Messages</span>
          {hasUnreadChats && (
            <span className="absolute top-1 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-900" />
          )}
        </button>

        {/* 👤 Profile */}
        <button
          onClick={() => setTab("profile")}
          className={`flex flex-col items-center gap-1 transition cursor-pointer min-w-12 py-1 ${
            tab === "profile" ? "text-orange-600 dark:text-orange-400 font-extrabold" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <User size={22} strokeWidth={tab === "profile" ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* ALL MODALS */}
      {showCreatePost && currentUser && (
        <CreatePostModal
          t={t}
          currentUser={currentUser}
          isAdmin={currentUser.email === ADMIN_EMAIL}
          onClose={() => {
            setShowCreatePost(false);
            setPostPrefill("");
          }}
          onSubmit={handleCreatePost}
          initialText={postPrefill}
          initialCategory={createPostCategory}
          defaultChallenge={createPostDefaultChallenge}
        />
      )}

      {editingPost && currentUser && (
        <CreatePostModal
          t={t}
          currentUser={currentUser}
          isAdmin={currentUser.email === ADMIN_EMAIL}
          isEdit
          initialText={editingPost.text}
          initialImages={editingPost.images}
          initialCategory={editingPost.category || "general"}
          onClose={() => setEditingPost(null)}
          onSubmit={(text, images) => handleUpdatePost(editingPost.id, text, images)}
        />
      )}

      {showAddStory && (
        <AddStoryModal
          t={t}
          onClose={() => setShowAddStory(false)}
          onSubmit={handleAddStory}
        />
      )}

      {showStoryViewer && activeStories.length > 0 && (
        <StoryViewer
          stories={activeStories}
          initialIndex={storyViewerIndex}
          onClose={() => setShowStoryViewer(false)}
          onSendReaction={(story, emoji) => {
            if (currentUser) {
              handleSendMessage(story.email, `${emoji} (Reacted to story: "${story.text}")`);
              flashToast(`Sent ${emoji} to ${story.name}`);
            }
          }}
          onStoryViewed={handleStoryViewed}
        />
      )}

      {showSobrietyModal && currentUser && (
        <SobrietyChallengeModal
          t={t}
          currentUser={currentUser}
          posts={posts}
          challengeStartDate={challengeStartDate}
          isAdmin={currentUser.email === ADMIN_EMAIL}
          onClose={() => setShowSobrietyModal(false)}
          onStart={handleStartChallenge}
          onTakePledge={handleTakePledge}
          onGoPost={() => {
            setShowSobrietyModal(false);
            setCreatePostCategory("challenge");
            setCreatePostDefaultChallenge(true);
            setShowCreatePost(true);
          }}
          onShareMilestone={days => {
            setShowSobrietyModal(false);
            setPostPrefill(`🏆 Celebrated Day ${days} of our 100-Day Recovery Challenge! Standing proud and clean with my tribe.`);
            setCreatePostCategory("challenge");
            setCreatePostDefaultChallenge(true);
            setShowCreatePost(true);
          }}
          renderPost={post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              t={t}
              lang={lang}
              isFollowing={followingSet.has(post.author)}
              authorSentimentIcon={users[post.author]?.todayReflection?.emotionIcon}
              authorDaysClean={users[post.author]?.sobrietyDate ? daysSince(users[post.author]?.sobrietyDate) : (post.milestoneDay || 0)}
              translatedText={translatedMap[post.id]?.[lang]}
              isShowingOriginal={Boolean(showOriginalMap[post.id])}
              isTranslating={translatingPostId === post.id}
              showComments={openCommentsPostId === post.id}
              onToggleComments={() =>
                setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)
              }
              onLike={() => handleToggleLike(post)}
              onSave={() => handleToggleSave(post)}
              onAddComment={txt => handleAddComment(post, txt)}
              onToggleFollow={() => handleToggleFollow(post.author)}
              onTranslate={() => handleTranslatePost(post)}
              onEdit={() => setEditingPost(post)}
              onDelete={() => handleDeletePost(post)}
              onReport={() => handleReportPost(post)}
              onBlock={() => handleBlockUser(post.author)}
              onShare={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`https://recoverytribe.app/p/${post.id}`);
                  flashToast(t.linkCopied);
                }
              }}
            />
          )}
        />
      )}

      {showCertificateModal && currentUser && (
        <MilestoneCertificateModal
          t={t}
          name={currentUser.name}
          daysClean={userSobrietyDays}
          startDate={currentUser.sobrietyDate}
          onClose={() => setShowCertificateModal(false)}
          onShareToFeed={shareMsg => {
            handleCreatePost(shareMsg, [], "milestone", false);
          }}
        />
      )}

      {showUrgeSurfing && (
        <UrgeSurfingModal t={t} onClose={() => setShowUrgeSurfing(false)} />
      )}

      {showRecoveryHub && currentUser && (
        <RecoveryHubModal
          t={t}
          currentUser={currentUser}
          initialTab={recoveryHubTab}
          onHabitsUpdated={refreshHabits}
          onReflectionSaved={handleReflectionSaved}
          onClose={() => {
            setShowRecoveryHub(false);
            setRecoveryHubTab('overview');
          }}
          onOpen100DayHub={() => {
            setShowRecoveryHub(false);
            setShowSobrietyModal(true);
          }}
          onOpenUrgeSurfing={() => {
            setShowRecoveryHub(false);
            setShowUrgeSurfing(true);
          }}
          onOpenCrisis={() => {
            setShowRecoveryHub(false);
            setShowCrisisModal(true);
          }}
          onOpenCertificate={() => {
            setShowRecoveryHub(false);
            setShowCertificateModal(true);
          }}
          onShareMilestoneToFeed={days => {
            setShowRecoveryHub(false);
            handleShareMilestoneToFeed(days);
          }}
          onPledgeToday={handlePledgeToday}
        />
      )}

      {showCrisisModal && (
        <CrisisModal
          t={t}
          onClose={() => setShowCrisisModal(false)}
          onOpenUrgeSurfing={() => setShowUrgeSurfing(true)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          t={t}
          theme={theme}
          onToggleTheme={toggleThemeMode}
          onOpenLang={() => {
            setShowSettingsModal(false);
            setShowLangModal(true);
          }}
          onOpenCrisis={() => {
            setShowSettingsModal(false);
            setShowCrisisModal(true);
          }}
          onOpenUrgeSurfing={() => {
            setShowSettingsModal(false);
            setShowUrgeSurfing(true);
          }}
          onOpenBlocked={() => {
            setShowSettingsModal(false);
            setShowBlockedModal(true);
          }}
          onResetData={handleResetData}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotifs && currentUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {t.notifications || "Notifications"}
                </h3>
                {unreadNotifsCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                    {unreadNotifsCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {myNotifs.length > 0 && (
                  <button
                    onClick={() => {
                      const updated = myNotifs.map(n => ({ ...n, read: true }));
                      setNotifs(prev => ({ ...prev, [currentUser.email]: updated }));
                      setShared("notif:" + currentUser.email, updated);
                    }}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifs(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
              {myNotifs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                    <Bell size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    {t.noNotifications}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    {t.noNotificationsSub}
                  </p>
                </div>
              ) : (
                myNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) {
                        const updated = myNotifs.map(item => item.id === n.id ? { ...item, read: true } : item);
                        setNotifs(prev => ({ ...prev, [currentUser.email]: updated }));
                        setShared("notif:" + currentUser.email, updated);
                      }
                      if (n.postId) {
                        setOpenCommentsPostId(n.postId);
                        setShowNotifs(false);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      !n.read
                        ? "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/40"
                        : "bg-white dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                      {n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'follow' ? '👤' : '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                        <span className="font-extrabold">{n.actorName}</span>{' '}
                        {n.type === 'like' && 'liked your post'}
                        {n.type === 'comment' && 'commented on your post'}
                        {n.type === 'follow' && 'followed your recovery journey'}
                        {n.type === 'milestone' && 'celebrated a recovery milestone'}
                        {n.type === 'story_view' && 'viewed your story'}
                      </p>
                      {n.detail && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          "{n.detail}"
                        </p>
                      )}
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        {relTime(n.timestamp, t)}
                      </span>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showLangModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{t.changeLanguage}</h4>
                  <p className="text-[10px] text-zinc-400">13 Indian Languages Supported</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLangModal(false);
                  setLangSearchFilter("");
                }}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer transition text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Instant Quick Toggle Bar: English <-> Hindi / Previous */}
            <div className="mb-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const targetCode: LanguageCode = lang === "en" ? "hi" : "en";
                  chooseLanguage(targetCode);
                  setShowLangModal(false);
                  setLangSearchFilter("");
                  flashToast(`Language set to ${LANGS.find(l => l.code === targetCode)?.native}`);
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center justify-between hover:bg-orange-100 dark:hover:bg-orange-900/40 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <RotateCcw size={12} />
                  <span>1-Tap Quick Toggle</span>
                </span>
                <span className="font-extrabold text-[11px] underline">
                  {lang === "en" ? "Switch to हिन्दी" : "Switch to English"}
                </span>
              </button>
            </div>

            {/* Search Filter Input */}
            <div className="relative mb-2.5 shrink-0">
              <input
                type="text"
                value={langSearchFilter}
                onChange={e => setLangSearchFilter(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {langSearchFilter && (
                <button
                  type="button"
                  onClick={() => setLangSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* All 13 Languages List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {LANGS.filter(l =>
                l.native.toLowerCase().includes(langSearchFilter.toLowerCase()) ||
                l.label.toLowerCase().includes(langSearchFilter.toLowerCase()) ||
                l.code.toLowerCase().includes(langSearchFilter.toLowerCase())
              ).map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    chooseLanguage(l.code);
                    setShowLangModal(false);
                    setLangSearchFilter("");
                    flashToast(`Language set to ${l.native}`);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    lang === l.code
                      ? "border-orange-500 bg-orange-50/90 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-2xs"
                      : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black uppercase ${
                        lang === l.code
                          ? "bg-orange-500 text-white shadow-2xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {l.code}
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-sm leading-tight">{l.native}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">{l.label}</div>
                    </div>
                  </div>
                  {lang === l.code && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-2xs">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showFollowersModal && currentUser && (
        <FollowersModal
          t={t}
          title={showFollowersModal.title}
          emails={showFollowersModal.emails}
          users={users}
          currentUser={currentUser}
          onToggleFollow={handleToggleFollow}
          onStartChat={peer => {
            setTab("messages");
          }}
          onClose={() => setShowFollowersModal(null)}
        />
      )}

      {showBlockedModal && currentUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
              <h4 className="text-sm font-extrabold">{t.blockedAccounts}</h4>
              <button onClick={() => setShowBlockedModal(false)} className="text-zinc-400">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(currentUser.blocked || []).length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">{t.noBlocked}</div>
              ) : (
                (currentUser.blocked || []).map(bEmail => (
                  <div key={bEmail} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                    <span className="font-bold">{users[bEmail]?.name || bEmail}</span>
                    <button
                      onClick={() => handleUnblockUser(bEmail)}
                      className="py-1 px-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-bold"
                    >
                      {t.unblock}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xs w-full p-5 shadow-2xl text-center space-y-4">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  confirmDialog.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}

/* ---------------------------------------------------------------
   POST CARD COMPONENT
---------------------------------------------------------------- */
function PostCard({
  post,
  currentUser,
  t,
  lang,
  isFollowing,
  translatedText,
  isShowingOriginal,
  isTranslating,
  showComments,
  onToggleComments,
  onLike,
  onSave,
  onAddComment,
  onToggleFollow,
  onTranslate,
  onEdit,
  onDelete,
  onReport,
  onBlock,
  onShare,
  authorSentimentIcon,
  authorDaysClean,
}: {
  post: Post;
  currentUser: UserType;
  t: typeof T.en;
  lang: LanguageCode;
  isFollowing: boolean;
  translatedText?: string;
  isShowingOriginal?: boolean;
  isTranslating: boolean;
  showComments: boolean;
  onToggleComments: () => void;
  onLike: () => void;
  onSave: () => void;
  onAddComment: (text: string) => void;
  onToggleFollow: () => void;
  onTranslate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBlock: () => void;
  onShare: () => void;
  authorSentimentIcon?: string;
  authorDaysClean?: number;
}) {
  const [commentInput, setCommentInput] = useState("");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthor = post.author === currentUser.email;
  const isLiked = post.likedBy.includes(currentUser.email);
  const isSaved = (post.savedBy || []).includes(currentUser.email);

  const categoryBadges: Record<PostCategory, { label: string; color: string }> = {
    general: { label: t.categoryGeneral, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
    challenge: { label: "100-Day", color: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300" },
    milestone: { label: "Milestone", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
    support: { label: "Support", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
    gratitude: { label: "Gratitude", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  };

  const badge = categoryBadges[post.category || "general"];

  return (
    <article className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <Avatar
            name={post.authorName}
            email={post.author}
            size={42}
            sentimentIcon={authorSentimentIcon}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight flex items-center gap-1">
                <span>{post.authorName}</span>
                {authorSentimentIcon && (
                  <span className="text-xs select-none" title="Today's Reflection Sentiment">
                    {authorSentimentIcon}
                  </span>
                )}
              </h4>
              {authorDaysClean && authorDaysClean > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40 inline-flex items-center gap-0.5">
                  🌱 {authorDaysClean}d Clean
                </span>
              ) : null}
              {badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span>{relTime(post.timestamp, t)}</span>
              {post.edited ? <span>• {t.editedLabel}</span> : null}
              {post.mood ? <span>• {post.mood}</span> : null}
              {post.privacy === 'tribe' ? <span>• 🔒 Tribe</span> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {!isAuthor && (
            <button
              onClick={onToggleFollow}
              className={`py-1 px-3 rounded-full text-xs font-bold transition cursor-pointer ${
                isFollowing
                  ? "border border-zinc-200 dark:border-zinc-700 text-zinc-500"
                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
              }`}
            >
              {isFollowing ? t.followingBtn : t.followBtn}
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full cursor-pointer"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl py-1 z-20 w-36 text-xs font-bold divide-y divide-zinc-100 dark:divide-zinc-700">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} /> {t.edit}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <X size={14} /> {t.deleteBtn}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onReport();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                  >
                    {t.report}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onBlock();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-red-600 cursor-pointer"
                  >
                    {t.block}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Milestone Celebratory Banner */}
      {post.milestoneDay && post.milestoneDay > 0 && (
        <div className="mx-4 mt-1 mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <span className="font-extrabold text-amber-700 dark:text-amber-400 block">
                Day {post.milestoneDay} Recovery Milestone
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Claimed clean and sober with the tribe
              </span>
            </div>
          </div>
          <Award size={18} className="text-amber-500" />
        </div>
      )}

      {/* Mood & Privacy Tag */}
      {(post.mood || post.privacy === 'tribe') && (
        <div className="px-4 pb-1 flex items-center gap-1.5 flex-wrap">
          {post.mood && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100/80 dark:bg-zinc-800 text-orange-700 dark:text-orange-300">
              Recovery Mood: {post.mood}
            </span>
          )}
          {post.privacy === 'tribe' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              🔒 Tribe Only
            </span>
          )}
        </div>
      )}

      {/* Post Text & Translation */}
      <div className="px-4 py-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
        {translatedText && !isShowingOriginal ? translatedText : post.text}
      </div>

      {/* Recovery Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {post.hashtags.map((h, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Translate Action Link */}
      {post.text && (
        <div className="px-4 pb-2">
          {isTranslating ? (
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 animate-pulse">
              <RotateCcw size={11} className="animate-spin text-orange-500" />
              <span>{t.translating}</span>
            </span>
          ) : translatedText && !isShowingOriginal ? (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} className="stroke-[3]" />
                <span>Translated to {LANGS.find(l => l.code === lang)?.native || lang.toUpperCase()}</span>
              </span>
              <button
                type="button"
                onClick={onTranslate}
                className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
                title="View original post text"
              >
                <RotateCcw size={10} />
                <span>{t.seeOriginal || "View Original"}</span>
              </button>
            </div>
          ) : translatedText && isShowingOriginal ? (
            <button
              type="button"
              onClick={onTranslate}
              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
              title="Show translated text"
            >
              <Globe size={12} />
              <span>View in {LANGS.find(l => l.code === lang)?.native || lang.toUpperCase()}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onTranslate}
              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Globe size={12} />
              <span>{t.translate}</span>
            </button>
          )}
        </div>
      )}

      {/* Multi-Image Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative mt-1">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar max-h-96"
            onScroll={e => {
              const width = e.currentTarget.clientWidth;
              if (width > 0) setActiveImgIdx(Math.round(e.currentTarget.scrollLeft / width));
            }}
          >
            {post.images.map((img, i) => (
              <div key={i} className="min-w-full snap-center bg-zinc-950 flex items-center justify-center">
                {img.startsWith('data:video/') || img.endsWith('.mp4') || img.endsWith('.webm') ? (
                  <video src={img} controls className="w-full h-auto max-h-96 object-cover" />
                ) : (
                  <img src={img} alt="" className="w-full h-auto max-h-96 object-cover" />
                )}
              </div>
            ))}
          </div>

          {post.images.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2 bg-zinc-50 dark:bg-zinc-900">
              {post.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeImgIdx ? "w-3 bg-orange-500" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 text-xs font-bold text-zinc-500">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl transition active:scale-90 cursor-pointer ${
            isLiked ? "text-rose-600 dark:text-rose-400" : "hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
          title={isLiked ? "Unlike" : "Like"}
          aria-label="Like post"
        >
          <Heart size={19} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
          <span>{post.likedBy.length}</span>
        </button>

        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl hover:text-zinc-800 dark:hover:text-zinc-200 transition active:scale-95 cursor-pointer"
          title="Comments"
          aria-label="Toggle comments"
        >
          <MessageCircle size={19} />
          <span>{post.comments.length}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl hover:text-zinc-800 dark:hover:text-zinc-200 transition active:scale-95 cursor-pointer"
          title="Share Post"
          aria-label="Share post"
        >
          <Share2 size={19} />
          <span>{t.share}</span>
        </button>

        <button
          onClick={onSave}
          className={`min-h-[44px] px-3 rounded-xl transition active:scale-90 cursor-pointer flex items-center justify-center ${
            isSaved ? "text-orange-600 dark:text-orange-400" : "hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
          title={isSaved ? "Saved" : "Save Post"}
          aria-label="Save post"
        >
          <Bookmark size={19} className={isSaved ? "fill-orange-500 text-orange-500" : ""} />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {post.comments.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-zinc-400">
                No words shared yet. Leave a note of courage!
              </div>
            ) : (
              post.comments.map(c => (
                <div key={c.id} className="flex gap-2.5 text-xs">
                  <Avatar name={c.author} email={c.email} size={28} />
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2.5 rounded-2xl flex-1">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100 block">
                      {c.author}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{c.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && commentInput.trim()) {
                  onAddComment(commentInput);
                  setCommentInput("");
                }
              }}
              placeholder={t.writeComment}
              className="flex-1 py-2 px-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <button
              onClick={() => {
                if (commentInput.trim()) {
                  onAddComment(commentInput);
                  setCommentInput("");
                }
              }}
              disabled={!commentInput.trim()}
              className="p-2 bg-orange-500 text-white rounded-full disabled:opacity-40 transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------
   PROFILE VIEW
---------------------------------------------------------------- */
function ProfileView({
  t,
  currentUser,
  users,
  posts,
  groups,
  editing,
  onEdit,
  onCancel,
  onSave,
  onLogout,
  onOpenSettings,
  onOpenCertificate,
  onOpenRecoveryHub,
  onOpenReflection,
  onJoinGroup,
  onShowFollowersList,
  onToggleSave,
  onLikePost,
  onDeletePost,
  onEditPost,
  onShareMilestone,
}: {
  t: typeof T.en;
  currentUser: UserType;
  users: Record<string, UserType>;
  posts: Post[];
  groups: SupportGroup[];
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (name: string, bio: string, sobrietyDate: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenCertificate: () => void;
  onOpenRecoveryHub: () => void;
  onOpenReflection?: () => void;
  onJoinGroup: (groupId: string) => void;
  onShowFollowersList: (mode: "followers" | "following") => void;
  onToggleSave: (post: Post) => void;
  onLikePost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onShareMilestone?: (days: number) => void;
}) {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [sobrietyDate, setSobrietyDate] = useState(
    currentUser.sobrietyDate || new Date().toISOString().slice(0, 10)
  );
  const [subTab, setSubTab] = useState<"myPosts" | "saved" | "groups" | "milestones" | "privacy">("myPosts");

  const myPosts = posts.filter(p => p.author === currentUser.email);
  const savedPosts = posts.filter(p => (p.savedBy || []).includes(currentUser.email));
  const userSobrietyDays = daysSince(currentUser.sobrietyDate);

  const followersCount = Object.entries(users).filter(([_, u]) =>
    (u.following || []).includes(currentUser.email)
  ).length;

  const myGroups = groups.filter(g => (currentUser.groups || []).includes(g.id));

  const MILESTONE_DEFINITIONS = [
    { days: 1, title: 'Day 1: First Sunrise', badge: '🌱', desc: 'The hardest and most heroic choice you will ever make.' },
    { days: 7, title: 'Day 7: Physical Clarity', badge: '🌿', desc: 'Toxins leaving the bloodstream, sleep slowly returning.' },
    { days: 14, title: 'Day 14: Fortitude', badge: '🛡️', desc: 'Two solid weeks of choosing calm over chaos.' },
    { days: 30, title: 'Day 30: Bronze Serenity', badge: '🥉', desc: 'A full monthly cycle clean. Habits resetting.' },
    { days: 60, title: 'Day 60: Silver Stability', badge: '🥈', desc: 'Deep emotional equilibrium and nervous system rewiring.' },
    { days: 90, title: 'Day 90: Golden Transformation', badge: '🥇', desc: 'Significant neuroplastic recovery and mental presence.' },
    { days: 100, title: 'Day 100: Century Master', badge: '🔥', desc: 'Completed the 100-Day Clean Journey! Master of serenity.' },
    { days: 365, title: '1 Year: Golden Serenity Chip', badge: '👑', desc: 'A full year around the sun reborn in sobriety.' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-xs">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <button
            onClick={onOpenRecoveryHub}
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Recovery Tools Suite"
          >
            <Sparkles size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <Avatar
            name={currentUser.name}
            email={currentUser.email}
            size={80}
            ring
            sentimentIcon={currentUser.todayReflection?.emotionIcon}
          />

          {!editing ? (
            <>
              <div className="flex items-center gap-1.5 mt-3 justify-center">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {currentUser.name}
                </h3>
                {currentUser.todayReflection?.emotionIcon && (
                  <button
                    type="button"
                    onClick={onOpenReflection}
                    className="text-lg hover:scale-125 transition cursor-pointer p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title={`Today's Emotion: ${currentUser.todayReflection.emotion} (Focus: "${currentUser.todayReflection.oneWordFocus}")`}
                  >
                    {currentUser.todayReflection.emotionIcon}
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                {currentUser.bio || "Walking the path of recovery, one breath at a time."}
              </p>

              {/* Daily Sentiment & One-Word Focus Badge on Profile */}
              {currentUser.todayReflection ? (
                <div
                  onClick={onOpenReflection}
                  className="mt-3.5 py-1.5 px-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-sky-50/90 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-200/90 dark:border-indigo-800/80 flex items-center gap-2 cursor-pointer hover:border-indigo-300 transition group shadow-2xs"
                  title="Tap to update your reflection"
                >
                  <span className="text-base">{currentUser.todayReflection.emotionIcon}</span>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                      <span>{currentUser.todayReflection.emotion}</span>
                      <span className="text-zinc-400 font-normal">•</span>
                      <span className="text-sky-600 dark:text-sky-400 font-extrabold">
                        "{currentUser.todayReflection.oneWordFocus}"
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded-md ml-auto">
                    Today
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenReflection}
                  className="mt-3.5 py-1.5 px-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-dashed border-indigo-300 dark:border-indigo-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <Sparkles size={13} />
                  <span>Set Today's Emotion & One-Word Focus</span>
                </button>
              )}

              {/* Serenity Chip & Certificate */}
              <div className="mt-3.5 flex items-center gap-2">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-black">
                  🕊️ {userSobrietyDays} {t.daysCleanSuffix}
                </div>
                <button
                  onClick={onOpenCertificate}
                  className="p-2 rounded-full bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition cursor-pointer"
                  title="View Official Certificate"
                >
                  <Award size={18} />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full justify-center text-center">
                <div>
                  <div className="text-base font-black">{myPosts.length}</div>
                  <div className="text-[11px] text-zinc-400">{t.posts}</div>
                </div>
                <div
                  onClick={() => onShowFollowersList("followers")}
                  className="cursor-pointer hover:opacity-80"
                >
                  <div className="text-base font-black">{followersCount}</div>
                  <div className="text-[11px] text-zinc-400">{t.followersLabel}</div>
                </div>
                <div
                  onClick={() => onShowFollowersList("following")}
                  className="cursor-pointer hover:opacity-80"
                >
                  <div className="text-base font-black">{(currentUser.following || []).length}</div>
                  <div className="text-[11px] text-zinc-400">{t.followingTab}</div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-5">
                <button
                  onClick={onEdit}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>{t.editProfile}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t.logout}</span>
                </button>
              </div>
            </>
          ) : (
            /* Editing form */
            <div className="w-full mt-4 space-y-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  {t.nameLabel}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  {t.bio}
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  className="w-full mt-1 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  {t.sobrietyDateLabel}
                </label>
                <input
                  type="date"
                  value={sobrietyDate}
                  onChange={e => setSobrietyDate(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => onSave(name, bio, sobrietyDate)}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-Tab Profile Segmented Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-extrabold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab("myPosts")}
          className={`py-3 px-3 flex items-center justify-center gap-1.5 transition border-b-2 shrink-0 cursor-pointer ${
            subTab === "myPosts"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Grid3x3 size={15} />
          <span>{t.posts} ({myPosts.length})</span>
        </button>
        <button
          onClick={() => setSubTab("saved")}
          className={`py-3 px-3 flex items-center justify-center gap-1.5 transition border-b-2 shrink-0 cursor-pointer ${
            subTab === "saved"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Bookmark size={15} />
          <span>{t.savedTab} ({savedPosts.length})</span>
        </button>
        <button
          onClick={() => setSubTab("groups")}
          className={`py-3 px-3 flex items-center justify-center gap-1.5 transition border-b-2 shrink-0 cursor-pointer ${
            subTab === "groups"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <HeartHandshake size={15} />
          <span>Groups ({myGroups.length})</span>
        </button>
        <button
          onClick={() => setSubTab("milestones")}
          className={`py-3 px-3 flex items-center justify-center gap-1.5 transition border-b-2 shrink-0 cursor-pointer ${
            subTab === "milestones"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Award size={15} />
          <span>Milestones</span>
        </button>
        <button
          onClick={() => setSubTab("privacy")}
          className={`py-3 px-3 flex items-center justify-center gap-1.5 transition border-b-2 shrink-0 cursor-pointer ${
            subTab === "privacy"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <ShieldAlert size={15} />
          <span>Privacy</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-3">
        {/* POSTS TAB */}
        {subTab === "myPosts" && (
          myPosts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
              {t.noOwnPosts}
            </div>
          ) : (
            myPosts.map(p => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2 shadow-xs"
              >
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                  <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => onEditPost(p)} className="hover:text-zinc-700 cursor-pointer">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => onDeletePost(p)} className="hover:text-red-500 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{p.text}</p>
                {p.images && p.images.length > 0 && (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-full h-40 object-cover rounded-2xl mt-2"
                  />
                )}
              </div>
            ))
          )
        )}

        {/* SAVED TAB */}
        {subTab === "saved" && (
          savedPosts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
              {t.noSavedPosts}
            </div>
          ) : (
            savedPosts.map(p => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 space-y-2 shadow-xs"
              >
                <div className="flex justify-between items-center text-xs">
                  <b className="font-extrabold text-zinc-900 dark:text-zinc-100">{p.authorName}</b>
                  <button onClick={() => onToggleSave(p)} className="text-orange-500 cursor-pointer">
                    <Bookmark size={16} fill="currentColor" />
                  </button>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">{p.text}</p>
              </div>
            ))
          )
        )}

        {/* SUPPORT GROUPS TAB */}
        {subTab === "groups" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
              <span>Peer Support Circles Joined</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{myGroups.length} active</span>
            </div>
            {myGroups.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                You haven&apos;t joined any recovery support circles yet.
                <p className="text-[11px] mt-1 text-orange-500">Tap &apos;Explore&apos; in the bottom bar to discover circles.</p>
              </div>
            ) : (
              myGroups.map(g => (
                <div
                  key={g.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                      {g.icon || "🌱"}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{g.name}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{g.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-zinc-400">
                        <span>👥 {g.membersCount} warriors</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Active Member</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onJoinGroup(g.id)}
                    className="py-1 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-600 text-[10px] font-bold shrink-0 transition cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* RECOVERY MILESTONES TAB */}
        {subTab === "milestones" && (
          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-300 dark:border-orange-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 block">
                  Current Journey: {userSobrietyDays} Days Clean
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Every 24 hours without alcohol is a triumph of courage.
                </span>
              </div>
              <button
                onClick={onOpenCertificate}
                className="py-1.5 px-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-[10px] font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
              >
                Certificate
              </button>
            </div>

            <div className="space-y-2.5">
              {MILESTONE_DEFINITIONS.map(m => {
                const isUnlocked = userSobrietyDays >= m.days;
                return (
                  <div
                    key={m.days}
                    className={`p-3.5 rounded-3xl border transition flex items-center justify-between gap-3 ${
                      isUnlocked
                        ? "bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-900/60 shadow-xs"
                        : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{m.badge}</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">{m.title}</h4>
                          {isUnlocked ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Achieved ✓
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-zinc-400">
                              {m.days - userSobrietyDays}d away
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{m.desc}</p>
                      </div>
                    </div>

                    {isUnlocked && onShareMilestone && (
                      <button
                        onClick={() => onShareMilestone(m.days)}
                        className="py-1 px-2.5 rounded-xl bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 hover:bg-orange-200 text-[10px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                      >
                        <Share2 size={12} />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRIVACY CONTROLS TAB */}
        {subTab === "privacy" && (
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs shadow-xs">
            <div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                Recovery Privacy & Security
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                You are in complete control of your identity, sobriety milestone disclosure, and peer visibility.
              </p>
            </div>

            <div className="space-y-3 pt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                    Anonymous Mode Option
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Choose anonymity per post or check in anonymously anytime.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                  Active in App
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                    Public Sobriety Date Counter
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Calculates clean days safely without broadcasting exact clinical data.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-1 rounded-md">
                  Safe Count
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                    Peer Blocking & Moderation
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Instantly block any account or report harassment to maintain a safe healing environment.
                  </span>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="py-1 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   STORY MODAL
---------------------------------------------------------------- */
const STORY_GRADIENTS = [
  "linear-gradient(135deg, #FF6B35, #C2185B)",
  "linear-gradient(135deg, #2D6A4F, #52B788)",
  "linear-gradient(135deg, #3D5A80, #98C1D9)",
  "linear-gradient(135deg, #8E44AD, #E63946)",
  "linear-gradient(135deg, #D97706, #DC2626)",
];

function AddStoryModal({
  t,
  onClose,
  onSubmit,
}: {
  t: typeof T.en;
  onClose: () => void;
  onSubmit: (text: string, bg: string) => void;
}) {
  const [text, setText] = useState("");
  const [bg, setBg] = useState(STORY_GRADIENTS[0]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="max-w-xs w-full rounded-3xl overflow-hidden shadow-2xl">
        <div
          className="h-80 flex items-center justify-center p-6 text-center text-white"
          style={{ background: bg }}
        >
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t.storyPlaceholder}
            className="w-full bg-transparent text-white font-extrabold text-xl text-center focus:outline-none resize-none placeholder-white/60 font-serif"
            rows={5}
          />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 space-y-4">
          <div className="flex justify-center gap-2">
            {STORY_GRADIENTS.map((g, i) => (
              <button
                key={i}
                onClick={() => setBg(g)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  bg === g ? "scale-125 ring-2 ring-orange-500" : ""
                }`}
                style={{ background: g }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              disabled={!text.trim()}
              onClick={() => onSubmit(text, bg)}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 disabled:opacity-40 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              {t.postStoryBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   AUTH BOX (LOGIN / SIGNUP / QUICK DEMO)
---------------------------------------------------------------- */
function AuthBox({
  t,
  users,
  onLogin,
  onSignup,
}: {
  t: typeof T.en;
  users: Record<string, UserType>;
  onLogin: (email: string, remember: boolean) => void;
  onSignup: (email: string, name: string, pass: string, remember: boolean) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (mode === "login") {
      if (!email.trim() || !password) {
        setError(t.fillAllFields);
        return;
      }
      const key = email.trim().toLowerCase();
      const u = users[key];
      const hashed = await hashPassword(password);
      if (!u || u.password !== hashed) {
        setError(t.invalidCredentials);
        return;
      }
      onLogin(key, remember);
    } else {
      if (!name.trim() || !email.trim() || !password || !confirmPassword) {
        setError(t.fillAllFields);
        return;
      }
      const key = email.trim().toLowerCase();
      if (users[key]) {
        setError(t.emailExists);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
      onSignup(key, name, password, remember);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
      {/* Switch Tab */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
        <button
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            mode === "login"
              ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.loginTab}
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            mode === "signup"
              ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.signupTab}
        </button>
      </div>

      {mode === "signup" && (
        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase">{t.nameLabel}</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rahul or PeacefulWarrior"
            className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
          />
          <span className="text-[10px] text-zinc-400 mt-1 block">{t.nameHint}</span>
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-zinc-400 uppercase">{t.emailLabel}</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-zinc-400 uppercase">{t.passwordLabel}</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
        />
      </div>

      {mode === "signup" && (
        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase">
            {t.confirmPasswordLabel}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rem"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="accent-orange-500 rounded"
        />
        <label htmlFor="rem" className="text-xs text-zinc-500 cursor-pointer">
          {t.rememberMe}
        </label>
      </div>

      {error && <div className="text-xs text-red-500 font-bold">{error}</div>}

      <button
        onClick={handleSubmit}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
      >
        {mode === "login" ? t.loginBtn : t.signupBtn}
      </button>

      {/* QUICK DEMO LOGINS */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
          {t.quickDemoAccounts}
        </span>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => {
              setEmail(ADMIN_EMAIL);
              setPassword("12qw34er");
              setError("");
            }}
            className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
          >
            {t.loginAsAdmin}
          </button>
          <button
            onClick={() => {
              setEmail("priya.k@tribe.org");
              setPassword("password123");
              setError("");
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-zinc-800 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
          >
            {t.loginAsMember}
          </button>
        </div>
      </div>
    </div>
  );
}
