import React, { useState, useEffect } from 'react';
import {
  Check, Plus, Trash2, Flame, Droplets, Sparkles, Activity,
  Heart, BookOpen, Moon, Calendar, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, DailyHabitItem, HabitCompletionMap } from '../types';
import {
  DEFAULT_HABITS,
  getUserHabits,
  saveUserHabits,
  getUserHabitLogs,
  saveUserHabitLogs,
  calculateWeeklyHabitStreak,
} from '../storage';

interface DailyHabitTrackerProps {
  currentUser: User;
  onHabitsUpdated?: () => void;
  onHabitCompleted?: (habitTitle: string, allCompleted: boolean) => void;
}

export const DailyHabitTracker: React.FC<DailyHabitTrackerProps> = ({
  currentUser,
  onHabitsUpdated,
  onHabitCompleted,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [habits, setHabits] = useState<DailyHabitItem[]>(DEFAULT_HABITS);
  const [completedMap, setCompletedMap] = useState<HabitCompletionMap>({
    [todayStr]: ['habit_meditation', 'habit_water'],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Add custom habit modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<DailyHabitItem['category']>('Physical');

  // Load persisted habits & logs on mount or user change
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [savedHabits, savedLogs] = await Promise.all([
          getUserHabits(currentUser.email),
          getUserHabitLogs(currentUser.email),
        ]);
        if (mounted) {
          if (savedHabits && savedHabits.length > 0) setHabits(savedHabits);
          if (savedLogs) setCompletedMap(savedLogs);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load user habits', err);
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [currentUser.email]);

  // Completed IDs for today
  const todayCompletedIds = completedMap[todayStr] || [];
  const completedCount = habits.filter(h => todayCompletedIds.includes(h.id)).length;
  const totalCount = habits.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  // Streak calculations
  const streakInfo = calculateWeeklyHabitStreak(completedMap, habits.length);

  // Toggle completion of a habit for today
  const toggleHabit = async (habitId: string) => {
    const isCurrentlyDone = todayCompletedIds.includes(habitId);
    let updatedToday: string[];

    if (isCurrentlyDone) {
      updatedToday = todayCompletedIds.filter(id => id !== habitId);
    } else {
      updatedToday = [...todayCompletedIds, habitId];
    }

    const newLogs: HabitCompletionMap = {
      ...completedMap,
      [todayStr]: updatedToday,
    };
    setCompletedMap(newLogs);

    // Update streak for the habit item
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        if (!isCurrentlyDone) {
          return {
            ...h,
            streak: (h.streak || 0) + 1,
            lastCompletedDate: todayStr,
          };
        } else {
          return {
            ...h,
            streak: Math.max(0, (h.streak || 1) - 1),
          };
        }
      }
      return h;
    });
    setHabits(updatedHabits);

    // Persist via storage utility
    await Promise.all([
      saveUserHabitLogs(currentUser.email, newLogs),
      saveUserHabits(currentUser.email, updatedHabits),
    ]);

    // Celebrate when all completed!
    if (!isCurrentlyDone && updatedToday.length === habits.length) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
        });
      } catch {
        // ignore
      }
    }

    const habitObj = habits.find(h => h.id === habitId);
    if (onHabitCompleted && habitObj) {
      onHabitCompleted(habitObj.title, updatedToday.length === habits.length);
    }
    if (onHabitsUpdated) {
      onHabitsUpdated();
    }
  };

  // Add custom habit
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: DailyHabitItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Daily recovery and wellness micro-goal',
      category: newCategory,
      iconName: 'custom',
      streak: 0,
      isDefault: false,
    };

    const nextHabits = [...habits, newHabit];
    setHabits(nextHabits);
    await saveUserHabits(currentUser.email, nextHabits);

    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);

    if (onHabitsUpdated) onHabitsUpdated();
  };

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    const nextHabits = habits.filter(h => h.id !== habitId);
    setHabits(nextHabits);

    let nextLogs = completedMap;
    if (todayCompletedIds.includes(habitId)) {
      nextLogs = {
        ...completedMap,
        [todayStr]: todayCompletedIds.filter(id => id !== habitId),
      };
      setCompletedMap(nextLogs);
    }

    await Promise.all([
      saveUserHabits(currentUser.email, nextHabits),
      saveUserHabitLogs(currentUser.email, nextLogs),
    ]);

    if (onHabitsUpdated) onHabitsUpdated();
  };

  // Render habit icon helper
  const renderHabitIcon = (iconName: DailyHabitItem['iconName'], isDone: boolean) => {
    const iconClass = isDone ? 'text-emerald-500' : 'text-orange-500 dark:text-orange-400';
    switch (iconName) {
      case 'water':
        return <Droplets size={18} className={iconClass} />;
      case 'meditation':
        return <Sparkles size={18} className={iconClass} />;
      case 'exercise':
        return <Activity size={18} className={iconClass} />;
      case 'literature':
        return <BookOpen size={18} className={iconClass} />;
      case 'gratitude':
        return <Heart size={18} className={iconClass} />;
      case 'sleep':
        return <Moon size={18} className={iconClass} />;
      default:
        return <Flame size={18} className={iconClass} />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400">
        Loading your recovery habits...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily & Weekly Streak Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4.5 text-white shadow-lg">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100 uppercase tracking-wider">
              <Calendar size={13} />
              <span>Daily Habits & Goals</span>
            </div>
            <h3 className="mt-1 text-xl font-black">
              {isAllCompleted ? 'All Habits Crushed Today! 🎉' : `${completedCount} of ${totalCount} Habits Done`}
            </h3>
            <p className="mt-0.5 text-xs text-emerald-50/90">
              {isAllCompleted
                ? 'Your nervous system and dopamine balance thank you.'
                : 'Consistent micro-habits rewrite dopamine pathways for lasting sobriety.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-md shadow-xs">
            <span className="text-xl font-black">{progressPct}%</span>
            <span className="text-[10px] font-extrabold text-emerald-100 uppercase">Today</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-3.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20 shadow-inner">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Weekly Streak & Adherence Stats Row */}
        <div className="relative z-10 mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-xs">
              <Flame size={18} className="fill-current" />
            </div>
            <div>
              <div className="text-xs font-black">
                {streakInfo.currentConsecutiveStreak}-Day Streak
              </div>
              <div className="text-[10px] text-emerald-100 font-medium">
                {streakInfo.weeklyCompletedDaysCount}/7 days active this week
              </div>
            </div>
          </div>

          {/* Past 7 days visual badges */}
          <div className="flex items-center gap-1.5">
            {streakInfo.history7Days.map(item => (
              <div key={item.date} className="flex flex-col items-center">
                <span className="text-[9px] text-emerald-200 uppercase font-bold">{item.dayLabel}</span>
                <div
                  className={`mt-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                    item.isToday
                      ? item.completedCount > 0
                        ? 'bg-white text-emerald-700 ring-2 ring-emerald-300 shadow-xs'
                        : 'bg-white/30 text-white ring-2 ring-white/60'
                      : item.completedCount > 0
                      ? 'bg-emerald-300 text-emerald-950 shadow-2xs'
                      : 'bg-black/20 text-white/40'
                  }`}
                  title={`${item.date}: ${item.completedCount} habits checked`}
                >
                  {item.completedCount > 0 ? '✓' : '·'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
            Daily Recovery Checklist
          </h4>
          <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold px-2 py-0.5 rounded-full">
            {completedCount}/{totalCount}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-xl border border-orange-200/60 dark:border-orange-800/60 transition cursor-pointer"
        >
          <Plus size={13} />
          <span>Add Custom</span>
        </button>
      </div>

      {/* Habit Items List */}
      <div className="space-y-2">
        {habits.map(habit => {
          const isDone = todayCompletedIds.includes(habit.id);
          return (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
                isDone
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-300/80 dark:border-emerald-800/80 shadow-xs'
                  : 'bg-white dark:bg-zinc-850/80 border-zinc-200/80 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox Button */}
                <button
                  type="button"
                  aria-label={`Toggle ${habit.title}`}
                  className={`mt-0.5 h-6 w-6 rounded-xl flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-orange-500 text-transparent'
                  }`}
                >
                  <Check size={14} className={isDone ? 'stroke-[3]' : 'opacity-0'} />
                </button>

                {/* Habit details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-extrabold ${
                        isDone
                          ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-emerald-500/70'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        habit.category === 'Physical'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : habit.category === 'Mental'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                          : habit.category === 'Spiritual'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {habit.category}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                    {habit.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Streak & Delete option */}
              <div className="flex items-center gap-2 pl-2 shrink-0">
                {habit.streak > 0 && (
                  <div
                    className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-xl shadow-2xs ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300'
                    }`}
                    title={`${habit.streak} day streak`}
                  >
                    <Flame size={12} className="fill-current text-orange-500" />
                    <span>{habit.streak}d</span>
                  </div>
                )}

                {!habit.isDefault && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteHabit(habit.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-70 hover:opacity-100"
                    title="Delete habit"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Habit Modal Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Create Recovery Habit
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Add a daily action that supports your sobriety and peace of mind.
            </p>

            <form onSubmit={handleAddHabit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Recovery Literature, Yoga..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as DailyHabitItem['category'])}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Physical">Physical (Health, Water, Movement)</option>
                  <option value="Mental">Mental (Mindfulness, Urge Coping)</option>
                  <option value="Spiritual">Spiritual (Gratitude, Reflection, Reading)</option>
                  <option value="Rest">Rest & Sleep</option>
                  <option value="Custom">Custom Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  Short Goal / Guidance (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 minutes before bed"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
