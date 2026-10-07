import React, { useState, useEffect } from 'react';
import {
  X, Flame, Wind, BookOpen, Target, Sparkles, LifeBuoy, CheckCircle,
  Send, Bot, Award, AlertCircle, Shield, ChevronRight, Plus, Calendar, Share2,
  CheckSquare, Activity
} from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { User, CravingLog, JournalEntry, PersonalGoal, DailyReflection } from '../types';
import confetti from 'canvas-confetti';
import { DailyHabitTracker } from './DailyHabitTracker';
import { DailyReflectionCard } from './DailyReflectionCard';

interface RecoveryHubModalProps {
  t: TranslationDictionary;
  currentUser: User;
  onClose: () => void;
  onOpen100DayHub: () => void;
  onOpenUrgeSurfing: () => void;
  onOpenCrisis: () => void;
  onOpenCertificate: () => void;
  onShareMilestoneToFeed: (days: number) => void;
  onPledgeToday: () => void;
  initialTab?: 'overview' | 'reflection' | 'habits' | 'checkin' | 'cravings' | 'journal' | 'goals' | 'companion';
  onHabitsUpdated?: () => void;
  onReflectionSaved?: (reflection: DailyReflection) => void;
}

const COMMON_TRIGGERS = [
  'Stress / Work Pressure',
  'Loneliness / Empty Evening',
  'Social Gathering / Friends',
  'Fatigue / Exhaustion',
  'Anger / Emotional Frustration',
  'Celebration / Habitual Routine',
];

const COMPANION_RESPONSES = [
  "Take a slow, deep breath with me right now. You do not have to carry tomorrow's burdens today. Only this single moment.",
  "Craving feels like an escalating storm, but science shows cravings peak and fade in 15 to 20 minutes. Drink a cold glass of water and let us breathe together.",
  "You've shown tremendous courage just by acknowledging this urge instead of acting on it. That is neuroplasticity in action.",
  "Remember the reasons you embarked on this serenity journey. Peace of mind, morning clarity, and self-respect are waiting on the other side.",
  "If you feel alone right now, know that hundreds of warriors across the tribe are walking this exact path with you at this very moment.",
];

export const RecoveryHubModal: React.FC<RecoveryHubModalProps> = ({
  t,
  currentUser,
  onClose,
  onOpen100DayHub,
  onOpenUrgeSurfing,
  onOpenCrisis,
  onOpenCertificate,
  onShareMilestoneToFeed,
  onPledgeToday,
  initialTab = 'overview',
  onHabitsUpdated,
  onReflectionSaved,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reflection' | 'habits' | 'checkin' | 'cravings' | 'journal' | 'goals' | 'companion'
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Craving logging state
  const [cravingIntensity, setCravingIntensity] = useState(6);
  const [selectedTrigger, setSelectedTrigger] = useState(COMMON_TRIGGERS[0]);
  const [cravingNotes, setCravingNotes] = useState('');
  const [cravingLogs, setCravingLogs] = useState<CravingLog[]>(() => {
    try {
      const saved = localStorage.getItem(`rt_cravings_${currentUser.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Journal state
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('Grateful');
  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`rt_journals_${currentUser.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Goals state
  const [goals, setGoals] = useState<PersonalGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`rt_goals_${currentUser.email}`);
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'g1', title: '7 Days Alcohol Free', targetDays: 7, completed: false },
            { id: 'g2', title: '30 Days Clean (Bronze Chip)', targetDays: 30, completed: false },
            { id: 'g3', title: '60 Days Emotional Balance', targetDays: 60, completed: false },
            { id: 'g4', title: '90 Days Serenity Silver', targetDays: 90, completed: false },
            { id: 'g5', title: '100-Day Challenge Master', targetDays: 100, completed: false },
          ];
    } catch {
      return [];
    }
  });

  // AI Companion state
  const [companionInput, setCompanionInput] = useState('');
  const [companionMessages, setCompanionMessages] = useState<
    Array<{ id: string; sender: 'user' | 'bot'; text: string; time: string }>
  >([
    {
      id: 'm0',
      sender: 'bot',
      text: `Hello ${currentUser.name}. I am your 24/7 Recovery Companion. Whether you are facing a sudden urge, feeling vulnerable, or celebrating a quiet victory, I am here to listen without judgment. How is your heart today?`,
      time: 'Just now',
    },
  ]);

  const daysClean = currentUser.sobrietyDate
    ? Math.max(0, Math.floor((Date.now() - new Date(currentUser.sobrietyDate).getTime()) / 86400000))
    : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const isPledged = currentUser.pledgedToday === todayStr;

  const handleSaveCraving = () => {
    const newLog: CravingLog = {
      id: 'c_' + Date.now(),
      userEmail: currentUser.email,
      intensity: cravingIntensity,
      trigger: selectedTrigger,
      notes: cravingNotes.trim(),
      surfedMinutes: 5,
      timestamp: Date.now(),
    };
    const next = [newLog, ...cravingLogs];
    setCravingLogs(next);
    localStorage.setItem(`rt_cravings_${currentUser.email}`, JSON.stringify(next));
    setCravingNotes('');
    onOpenUrgeSurfing();
  };

  const handleSaveJournal = () => {
    if (!journalContent.trim()) return;
    const newEntry: JournalEntry = {
      id: 'j_' + Date.now(),
      userEmail: currentUser.email,
      title: journalTitle.trim() || 'Daily Recovery Note',
      content: journalContent.trim(),
      mood: journalMood,
      tags: ['Recovery', journalMood],
      timestamp: Date.now(),
    };
    const next = [newEntry, ...journals];
    setJournals(next);
    localStorage.setItem(`rt_journals_${currentUser.email}`, JSON.stringify(next));
    setJournalTitle('');
    setJournalContent('');
  };

  const toggleGoal = (id: string) => {
    const next = goals.map(g => (g.id === id ? { ...g, completed: !g.completed } : g));
    setGoals(next);
    localStorage.setItem(`rt_goals_${currentUser.email}`, JSON.stringify(next));
  };

  const handleSendCompanion = () => {
    if (!companionInput.trim()) return;
    const userText = companionInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsgs = [
      ...companionMessages,
      { id: 'u_' + Date.now(), sender: 'user' as const, text: userText, time: nowTime },
    ];
    setCompanionMessages(newMsgs);
    setCompanionInput('');

    setTimeout(() => {
      const randomReply =
        COMPANION_RESPONSES[Math.floor(Math.random() * COMPANION_RESPONSES.length)];
      setCompanionMessages(prev => [
        ...prev,
        {
          id: 'b_' + Date.now(),
          sender: 'bot' as const,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 select-none">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Sobriety Hub & Recovery Suite
              </h3>
              <p className="text-[10px] text-zinc-400">
                {daysClean} Days Clean • Evidence-based recovery tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
          {[
            { id: 'overview', label: 'Sobriety Hub', icon: <Flame size={12} /> },
            { id: 'reflection', label: 'Quick Reflection', icon: <Sparkles size={12} /> },
            { id: 'habits', label: 'Daily Habits', icon: <CheckSquare size={12} /> },
            { id: 'checkin', label: 'Daily Pledge', icon: <CheckCircle size={12} /> },
            { id: 'cravings', label: 'Craving & Urge', icon: <Wind size={12} /> },
            { id: 'journal', label: 'Private Journal', icon: <BookOpen size={12} /> },
            { id: 'goals', label: 'Goals & Badges', icon: <Target size={12} /> },
            { id: 'companion', label: 'AI Companion', icon: <Bot size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Daily Streak Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-200">
                      Your Alcohol-Free Journey
                    </span>
                    <h2 className="text-3xl font-black mt-0.5">{daysClean} Days Clean</h2>
                    <p className="text-xs text-white/90 mt-1 max-w-xs">
                      Every hour sober rewires your dopamine pathways and restores your nervous system.
                    </p>
                  </div>
                  <button
                    onClick={onOpenCertificate}
                    className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white shadow-xs transition active:scale-95"
                    title="View Certificate"
                  >
                    <Award size={24} />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onShareMilestoneToFeed(daysClean);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition"
                  >
                    <Share2 size={13} />
                    <span>Share to Tribe Feed</span>
                  </button>
                  <span className="text-[11px] text-white/80 font-medium">One Day At A Time</span>
                </div>
              </div>

              {/* Quick Launch Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpen100DayHub();
                  }}
                  className="p-3.5 bg-orange-50/70 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 rounded-2xl text-left hover:border-orange-300 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-2 shadow-xs">
                    <Flame size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    100-Day Challenge
                  </h4>
                  <p className="text-[10px] text-zinc-500">Organizer guided updates & check-ins</p>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenUrgeSurfing();
                  }}
                  className="p-3.5 bg-emerald-50/70 dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 rounded-2xl text-left hover:border-emerald-300 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-xs">
                    <Wind size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Urge Surfing
                  </h4>
                  <p className="text-[10px] text-zinc-500">4-7-8 Somatic breathwork</p>
                </button>

                <button
                  onClick={() => setActiveTab('cravings')}
                  className="p-3.5 bg-amber-50/70 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-2xl text-left hover:border-amber-300 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs">
                    <AlertCircle size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Craving Tracker
                  </h4>
                  <p className="text-[10px] text-zinc-500">Log intensity & trigger triggers</p>
                </button>

                <button
                  onClick={() => setActiveTab('companion')}
                  className="p-3.5 bg-purple-50/70 dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-2xl text-left hover:border-purple-300 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-2 shadow-xs">
                    <Bot size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    AI Companion
                  </h4>
                  <p className="text-[10px] text-zinc-500">24/7 Compassionate guidance</p>
                </button>
              </div>

              {/* Daily Quick Reflection Highlight Card */}
              <div
                onClick={() => setActiveTab('reflection')}
                className="p-3.5 bg-gradient-to-r from-indigo-50/90 to-sky-50/90 dark:from-indigo-950/20 dark:to-sky-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-xs text-base">
                    {currentUser.todayReflection?.emotionIcon || '🕊️'}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Daily Quick-Reflection</span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                        {currentUser.todayReflection?.emotion || 'Emotion & Focus'}
                      </span>
                    </h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {currentUser.todayReflection?.oneWordFocus
                        ? `Focus: "${currentUser.todayReflection.oneWordFocus}" • Profile sentiment active`
                        : 'Select primary emotion & one-word focus for your profile'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Daily Habit Tracker Highlight Card */}
              <div
                onClick={() => setActiveTab('habits')}
                className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckSquare size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Daily Habit Tracker</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">Wellness</span>
                    </h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Drink Water • Meditation • Exercise & daily routines
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Emergency Helpline Row */}
              <div
                onClick={() => {
                  onClose();
                  onOpenCrisis();
                }}
                className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
                      Emergency Crisis Helplines
                    </h5>
                    <p className="text-[10px] text-zinc-500">Tele-MANAS (14416) • 988 Free 24/7</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-rose-400" />
              </div>
            </div>
          )}

          {/* DAILY QUICK REFLECTION TAB */}
          {activeTab === 'reflection' && (
            <DailyReflectionCard
              currentUser={currentUser}
              onReflectionSaved={onReflectionSaved}
              onShareToFeed={text => {
                onShareMilestoneToFeed(0);
              }}
            />
          )}

          {/* DAILY HABIT TRACKER TAB */}
          {activeTab === 'habits' && (
            <DailyHabitTracker
              currentUser={currentUser}
              onHabitsUpdated={onHabitsUpdated}
            />
          )}

          {/* CHECK-IN TAB */}
          {activeTab === 'checkin' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Daily Alcohol-Free Pledge
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                  "Today, for the next 24 hours, I make a mindful pledge to myself and my tribe to remain clean and alcohol-free."
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[11px] font-bold text-zinc-400">Status for Today:</span>
                <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-1">
                  {isPledged ? "✅ Pledged & Safe Today!" : "⏳ Awaiting your pledge"}
                </div>
              </div>

              {!isPledged ? (
                <button
                  onClick={() => {
                    onPledgeToday();
                    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition"
                >
                  I Pledge For Today
                </button>
              ) : (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  You are honoring yourself today. Keep breathing!
                </div>
              )}
            </div>
          )}

          {/* CRAVINGS TAB */}
          {activeTab === 'cravings' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                <b>Craving Surge Tip:</b> Cravings are temporary somatic waves. Acknowledge them without judgment, rate them, and ride them out.
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  <span>Intensity (1 = Mild, 10 = Severe)</span>
                  <span className="text-orange-500 font-black text-sm">{cravingIntensity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cravingIntensity}
                  onChange={e => setCravingIntensity(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Identified Trigger
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COMMON_TRIGGERS.map(trig => (
                    <button
                      key={trig}
                      type="button"
                      onClick={() => setSelectedTrigger(trig)}
                      className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition ${
                        selectedTrigger === trig
                          ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {trig}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  What is happening right now? (Optional)
                </label>
                <textarea
                  value={cravingNotes}
                  onChange={e => setCravingNotes(e.target.value)}
                  placeholder="E.g., Finished work, felt an automatic urge to drink..."
                  rows={2}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveCraving}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Wind size={16} />
                <span>Save Log & Start 4-7-8 Urge Surfing</span>
              </button>

              {cravingLogs.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Recent Surfed Cravings ({cravingLogs.length})
                  </h5>
                  <div className="space-y-1.5">
                    {cravingLogs.slice(0, 3).map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-zinc-800 dark:text-zinc-200">
                            {log.trigger}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="text-xs font-black text-orange-600 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                          Lvl {log.intensity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRIVATE JOURNAL TAB */}
          {activeTab === 'journal' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <Shield size={16} className="text-emerald-500 shrink-0" />
                <span>Your journal entries are strictly private and stored on your device only.</span>
              </div>

              <input
                value={journalTitle}
                onChange={e => setJournalTitle(e.target.value)}
                placeholder="Title (e.g., Today's breakthrough, Night reflection)"
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />

              <textarea
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                placeholder="Write your honest thoughts, triggers, emotional state, or gratitudes..."
                rows={4}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  {['Grateful', 'Vulnerable', 'Peaceful', 'Challenged'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setJournalMood(m)}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition ${
                        journalMood === m
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveJournal}
                  disabled={!journalContent.trim()}
                  className="py-1.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Entry
                </button>
              </div>

              {journals.length > 0 && (
                <div className="pt-2 space-y-2">
                  <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Past Journal Entries ({journals.length})
                  </h5>
                  {journals.map(j => (
                    <div
                      key={j.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{j.title}</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(j.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {j.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Track personal stepping stones. Checking these marks milestones you have conquered.
              </p>
              <div className="space-y-2">
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      goal.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          goal.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-zinc-400'
                        }`}
                      >
                        {goal.completed && <CheckCircle size={14} />}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          goal.completed
                            ? 'line-through text-zinc-400'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {goal.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      {goal.targetDays}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI COMPANION TAB */}
          {activeTab === 'companion' && (
            <div className="flex flex-col h-72">
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                {companionMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  value={companionInput}
                  onChange={e => setCompanionInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendCompanion();
                  }}
                  placeholder="Share a craving or feeling with AI Companion..."
                  className="flex-1 py-2 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  onClick={handleSendCompanion}
                  className="p-2 bg-orange-600 text-white rounded-xl shadow-xs"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
