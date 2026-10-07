import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Heart, Compass, CheckCircle2, Share2, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, DailyReflection } from '../types';
import {
  PRIMARY_EMOTIONS,
  FOCUS_WORD_PRESETS,
  getUserDailyReflection,
  saveUserDailyReflection,
} from '../storage';

interface DailyReflectionCardProps {
  currentUser: User;
  onReflectionSaved?: (reflection: DailyReflection) => void;
  onShareToFeed?: (text: string) => void;
}

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({
  currentUser,
  onReflectionSaved,
  onShareToFeed,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedEmotion, setSelectedEmotion] = useState(PRIMARY_EMOTIONS[0].label);
  const [oneWordFocus, setOneWordFocus] = useState('Clarity');
  const [customWord, setCustomWord] = useState('');
  const [reflectionNote, setReflectionNote] = useState('');
  const [isSavedToday, setIsSavedToday] = useState(false);
  const [savedReflection, setSavedReflection] = useState<DailyReflection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing reflection for today
  useEffect(() => {
    let mounted = true;
    async function loadReflection() {
      try {
        const existing = await getUserDailyReflection(currentUser.email);
        if (mounted && existing) {
          setSavedReflection(existing);
          if (existing.date === todayStr) {
            setIsSavedToday(true);
            setSelectedEmotion(existing.emotion);
            setOneWordFocus(existing.oneWordFocus);
            if (existing.note) setReflectionNote(existing.note);
          }
        }
      } catch (err) {
        console.warn('Error loading daily reflection', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadReflection();
    return () => {
      mounted = false;
    };
  }, [currentUser.email, todayStr]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const activeEmotionObj = PRIMARY_EMOTIONS.find(e => e.label === selectedEmotion) || PRIMARY_EMOTIONS[0];
    const finalFocusWord = (customWord.trim() || oneWordFocus).trim();

    const reflection: DailyReflection = {
      date: todayStr,
      emotion: activeEmotionObj.label,
      emotionIcon: activeEmotionObj.icon,
      emotionColor: activeEmotionObj.color,
      oneWordFocus: finalFocusWord,
      note: reflectionNote.trim(),
      timestamp: Date.now(),
    };

    setSavedReflection(reflection);
    setIsSavedToday(true);

    try {
      await saveUserDailyReflection(currentUser.email, reflection);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#F59E0B', '#10B981', '#8B5CF6'],
      });
    } catch (err) {
      console.warn('Error saving reflection', err);
    }

    if (onReflectionSaved) {
      onReflectionSaved(reflection);
    }
  };

  const currentEmotionObj = PRIMARY_EMOTIONS.find(e => e.label === selectedEmotion) || PRIMARY_EMOTIONS[0];

  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400">
        Loading daily reflection...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reflection Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-teal-600 p-4.5 text-white shadow-lg">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-100 uppercase tracking-wider">
              <Sun size={13} />
              <span>Daily Quick-Reflection</span>
            </div>
            <h3 className="mt-1 text-xl font-black">
              {isSavedToday ? `Today's Focus: "${savedReflection?.oneWordFocus}"` : 'Ground Your Heart for Today'}
            </h3>
            <p className="mt-0.5 text-xs text-sky-100/90 max-w-xs">
              {isSavedToday
                ? `You are moving through today with ${savedReflection?.emotion} energy.`
                : 'Pause, identify your current emotion, and set a single guiding word for the day.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/20 p-2.5 backdrop-blur-md shadow-xs">
            <span className="text-2xl">{currentEmotionObj.icon}</span>
            <span className="text-[10px] font-black uppercase text-sky-100 mt-0.5">
              {currentEmotionObj.label}
            </span>
          </div>
        </div>

        {/* Saved badge indicator */}
        {isSavedToday && savedReflection && (
          <div className="relative z-10 mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-bold text-white">
              <CheckCircle2 size={14} className="text-emerald-300" />
              <span>Reflected today • Visible on your profile</span>
            </span>
            {onShareToFeed && (
              <button
                type="button"
                onClick={() => {
                  const shareText = `🌟 Daily Reflection: Feeling ${savedReflection.emotion} ${savedReflection.emotionIcon}. My one-word focus for today is "${savedReflection.oneWordFocus}". One day at a time! #DailyReflection #Sobriety`;
                  onShareToFeed(shareText);
                }}
                className="flex items-center gap-1 text-[11px] font-black bg-white text-indigo-700 px-2.5 py-1 rounded-xl shadow-xs active:scale-95 transition"
              >
                <Share2 size={12} />
                <span>Share to Feed</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: Select Primary Emotion */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300 tracking-wider flex items-center justify-between">
          <span>1. Primary Emotion Today</span>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 capitalize">
            {selectedEmotion}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PRIMARY_EMOTIONS.map(emo => {
            const isSelected = selectedEmotion === emo.label;
            return (
              <button
                key={emo.id}
                type="button"
                onClick={() => setSelectedEmotion(emo.label)}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500 scale-[1.02]'
                    : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <span className="text-lg">{emo.icon}</span>
                <span className="text-xs font-bold truncate">{emo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Choose One-Word Focus */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300 tracking-wider flex items-center justify-between">
          <span>2. One-Word Focus</span>
          <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400">
            "{customWord.trim() || oneWordFocus}"
          </span>
        </label>

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_WORD_PRESETS.map(word => {
            const isSelected = !customWord && oneWordFocus === word;
            return (
              <button
                key={word}
                type="button"
                onClick={() => {
                  setOneWordFocus(word);
                  setCustomWord('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-xs scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Or enter custom focus word */}
        <div className="pt-1.5">
          <input
            type="text"
            maxLength={20}
            placeholder="Or type a custom focus word (e.g. Resilience, Anchor)..."
            value={customWord}
            onChange={e => setCustomWord(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />
        </div>
      </div>

      {/* STEP 3: Optional Quick Reflection Note */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider block">
          Short Reflection / Intention (Optional)
        </label>
        <textarea
          rows={2}
          maxLength={140}
          placeholder="What intention or boundary will you honor today?"
          value={reflectionNote}
          onChange={e => setReflectionNote(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
        />
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={() => handleSave()}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
      >
        <Sparkles size={16} />
        <span>{isSavedToday ? "Update Today's Reflection" : "Save Today's Reflection & Display on Profile"}</span>
      </button>

      {/* Preview Card */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-850/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-lg shadow-2xs border border-zinc-200 dark:border-zinc-700">
            {currentEmotionObj.icon}
          </div>
          <div>
            <div className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{currentEmotionObj.label}</span>
              <span className="text-[10px] text-zinc-400 font-normal">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">
                "{customWord.trim() || oneWordFocus}"
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Sentiment icon displays next to your name & profile avatar
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black">
          Profile Ready
        </span>
      </div>
    </div>
  );
};
