import React, { useState } from 'react';
import { ArrowLeft, Flame, PlusCircle, Check, Award, Calendar, Sparkles, ShieldCheck, MessageCircle } from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { Post, User } from '../types';
import confetti from 'canvas-confetti';

interface SobrietyChallengeModalProps {
  t: TranslationDictionary;
  currentUser: User;
  posts: Post[];
  challengeStartDate: string | null;
  isAdmin: boolean;
  onClose: () => void;
  onStart: () => void;
  onShareMilestone: (days: number) => void;
  onGoPost: () => void;
  onTakePledge: () => void;
  renderPost: (post: Post) => React.ReactNode;
}

const CHALLENGE_TARGET = 100;
const MILESTONES = [10, 25, 50, 75, 100];

const DAILY_PROMPTS = [
  "What is one trigger you navigated with grace today?",
  "Who is someone in your life you feel grateful for right now?",
  "What does freedom look like to you this morning?",
  "Write down one lie addiction told you that you no longer believe.",
  "What healthy sensory comfort replaced an old habit today?",
  "How did you be gentle with yourself when stress arose?",
  "What is one promise you kept to yourself this week?",
];

export const SobrietyChallengeModal: React.FC<SobrietyChallengeModalProps> = ({
  t,
  currentUser,
  posts,
  challengeStartDate,
  isAdmin,
  onClose,
  onStart,
  onShareMilestone,
  onGoPost,
  onTakePledge,
  renderPost,
}) => {
  const [selectedDayPrompt, setSelectedDayPrompt] = useState<number | null>(null);

  // Calculate distinct calendar days checked in by admin/organizer
  const startTs = challengeStartDate ? new Date(challengeStartDate + "T00:00:00").getTime() : null;
  const daySet = new Set<string>();

  posts.forEach(p => {
    if (p.challengePost && startTs && p.timestamp >= startTs) {
      const d = new Date(p.timestamp);
      daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  });

  const completed = Math.min(daySet.size, CHALLENGE_TARGET);
  const progressPct = Math.min(100, (completed / CHALLENGE_TARGET) * 100);
  const isComplete = completed >= CHALLENGE_TARGET;
  const isMilestone = MILESTONES.includes(completed);

  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  })();

  const postedToday = posts.some(
    p => p.challengePost && (() => {
      const d = new Date(p.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey;
    })()
  );

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const hasPledgedToday = currentUser.pledgedToday === todayDateStr;

  const challengePosts = posts
    .filter(p => p.challengePost)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handlePledgeClick = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    onTakePledge();
  };

  return (
    <div className="fixed inset-0 z-40 bg-zinc-50 dark:bg-zinc-950 flex flex-col max-w-lg mx-auto overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-orange-500 via-amber-600 to-rose-600 text-white shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <div className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
            <Flame size={18} className="text-yellow-300" />
            <span>{t.challengeTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="text-[11px] font-extrabold bg-white/25 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <ShieldCheck size={13} />
              {t.adminControl}
            </span>
          ) : (
            <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
              {completed}/100 {t.daysCleanSuffix}
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {challengeStartDate ? (
          <>
            {/* Big Progress Card */}
            <div className="bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm text-center relative overflow-hidden">
              <div className="text-xs uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider mb-1">
                {isAdmin ? "Organizer Control Panel" : "Tribe 100-Day Journey"}
              </div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-300 my-1">
                {t.dayProgressTemplate.replace("{n}", completed.toString())}
              </div>

              {isComplete ? (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full my-2 shadow-xs">
                  🏆 {t.challengeCompleteLabel}
                </div>
              ) : isMilestone ? (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full my-2 shadow-xs animate-bounce">
                  🎉 {t.milestoneLabel}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  {t.challengeIntro}
                </p>
              )}

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden my-3 p-0.5 border border-zinc-200 dark:border-zinc-700">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Milestone chips */}
              <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-bold px-1 mb-4">
                {MILESTONES.map(m => (
                  <span
                    key={m}
                    className={`flex items-center gap-0.5 ${
                      completed >= m ? 'text-amber-600 dark:text-amber-400 font-black' : ''
                    }`}
                  >
                    {completed >= m && <Check size={11} strokeWidth={3} />}
                    {m}d
                  </span>
                ))}
              </div>

              {/* Today's Checkin State */}
              {isAdmin ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <span>{postedToday ? `✅ ${t.postedTodayYes}` : `⏳ ${t.postedTodayNo}`}</span>
                  <button
                    onClick={onGoPost}
                    className="py-1.5 px-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer hover:from-orange-600 hover:to-amber-700 transition"
                  >
                    + {t.postNowBtn}
                  </button>
                </div>
              ) : (
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold ${
                  postedToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  <span>{postedToday ? `✅ ${t.organizerPostedToday}` : `⏳ ${t.waitingForOrganizer}`}</span>
                </div>
              )}
            </div>

            {/* Organizer-Led Notice for Members */}
            {!isAdmin && (
              <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/50 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                  <ShieldCheck size={16} />
                  <span>{t.adminPostOnlyBadge}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.viewOnlyNote}
                </p>
              </div>
            )}

            {/* Daily Pledge Card (Available to All Members) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300/60 dark:border-amber-700/40 rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>{t.dailyPledgeTitle}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 italic mt-1 leading-snug">
                  {t.dailyPledgeText}
                </p>
              </div>
              <button
                onClick={handlePledgeClick}
                disabled={hasPledgedToday}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs shrink-0 transition active:scale-95 cursor-pointer ${
                  hasPledgedToday
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                {hasPledgedToday ? "✓ Pledged" : t.pledgeButton}
              </button>
            </div>

            {/* 100-Day Visual Grid */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    100-Day Stepping Stones
                  </h4>
                </div>
                <span className="text-[11px] text-zinc-400 font-semibold">Tap day for prompt</span>
              </div>

              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {Array.from({ length: 100 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isDone = dayNum <= completed;
                  const isCurrent = dayNum === completed + 1;
                  const isMilestoneDay = MILESTONES.includes(dayNum);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDayPrompt(dayNum)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition relative cursor-pointer ${
                        isDone
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs'
                          : isCurrent
                          ? 'border-2 border-orange-500 bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 animate-pulse'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {isMilestoneDay && isDone ? (
                        <Award size={10} className="text-yellow-200" />
                      ) : (
                        dayNum
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDayPrompt && (
                <div className="mt-4 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    <span>Day {selectedDayPrompt} Reflection Prompt</span>
                    <button onClick={() => setSelectedDayPrompt(null)} className="text-zinc-400 hover:text-zinc-600 text-xs">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    {DAILY_PROMPTS[(selectedDayPrompt - 1) % DAILY_PROMPTS.length]}
                  </p>
                </div>
              )}
            </div>

            {/* Admin-Only Publishing Controls */}
            {isAdmin && (
              <div className="space-y-2">
                <button
                  onClick={onGoPost}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={18} />
                  {t.postNowBtn}
                </button>

                {isMilestone && (
                  <button
                    onClick={() => onShareMilestone(completed)}
                    className="w-full py-2.5 px-4 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    {t.shareMilestone}
                  </button>
                )}
              </div>
            )}
          </>
        ) : isAdmin ? (
          /* Admin launch view */
          <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4">
            <Flame size={44} className="mx-auto text-orange-500 animate-pulse" />
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
              {t.startChallengePrompt}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t.startChallengePromptSub}
            </p>
            <button
              onClick={onStart}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              {t.startToday}
            </button>
          </div>
        ) : (
          <div className="text-center p-8 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <Flame size={36} className="mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.startChallengePromptSub}
            </p>
          </div>
        )}

        {/* Challenge Posts Feed */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.challengePostsTitle} ({challengePosts.length})
            </h4>
            <span className="text-[11px] text-zinc-400 font-medium">
              Like & Comment to Check In
            </span>
          </div>

          {/* Member comment-to-checkin encouragement banner */}
          <div className="p-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 shadow-2xs">
            <MessageCircle size={16} className="text-orange-500 shrink-0" />
            <span>{t.commentToCheckinHint}</span>
          </div>

          <div className="space-y-4">
            {challengePosts.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs">
                {t.noChallengePosts}
              </div>
            ) : (
              challengePosts.map(p => renderPost(p))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

