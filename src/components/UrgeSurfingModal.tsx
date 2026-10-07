import React, { useState, useEffect } from 'react';
import { X, Wind, HeartHandshake, CheckCircle } from 'lucide-react';
import { TranslationDictionary } from '../translations';
import confetti from 'canvas-confetti';

interface UrgeSurfingModalProps {
  t: TranslationDictionary;
  onClose: () => void;
}

export const UrgeSurfingModal: React.FC<UrgeSurfingModalProps> = ({ t, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'done'>('idle');
  const [countdown, setCountdown] = useState(4);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let timer: NodeJS.Timeout;

    if (phase === 'inhale') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setPhase('hold');
        setCountdown(7);
      }
    } else if (phase === 'hold') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setPhase('exhale');
        setCountdown(8);
      }
    } else if (phase === 'exhale') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        if (cycle >= 2) {
          setPhase('done');
          setIsActive(false);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } else {
          setCycle(c => c + 1);
          setPhase('inhale');
          setCountdown(4);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, phase, countdown, cycle]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
    setCycle(1);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('idle');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2 text-amber-600 dark:text-amber-500 font-bold text-sm tracking-wide uppercase">
          <Wind size={18} />
          <span>{t.urgeSurfingTitle}</span>
        </div>
        <h3 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 mb-2">
          {phase === 'done' ? "You Rode The Wave!" : "Ride Out The Cravings"}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          {t.urgeSurfingDesc}
        </p>

        {/* Animated Breathing Circle */}
        <div className="relative my-8 flex items-center justify-center h-48">
          <div
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-xl ${
              phase === 'inhale'
                ? 'scale-125 bg-gradient-to-tr from-amber-400 to-orange-500 text-white'
                : phase === 'hold'
                ? 'scale-125 bg-gradient-to-tr from-yellow-500 to-amber-600 text-white animate-pulse'
                : phase === 'exhale'
                ? 'scale-90 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white'
                : phase === 'done'
                ? 'scale-100 bg-gradient-to-tr from-emerald-500 to-green-600 text-white'
                : 'scale-100 bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-amber-400/50 text-zinc-700 dark:text-zinc-200'
            }`}
          >
            {phase === 'idle' && (
              <div className="p-3">
                <Wind size={36} className="mx-auto mb-1 text-amber-500 animate-bounce" />
                <span className="text-xs font-semibold">4-7-8 Rhythm</span>
              </div>
            )}
            {phase === 'inhale' && (
              <>
                <span className="text-3xl font-black">{countdown}</span>
                <span className="text-xs uppercase tracking-wider font-bold">{t.breatheIn}</span>
              </>
            )}
            {phase === 'hold' && (
              <>
                <span className="text-3xl font-black">{countdown}</span>
                <span className="text-xs uppercase tracking-wider font-bold">{t.holdBreath}</span>
              </>
            )}
            {phase === 'exhale' && (
              <>
                <span className="text-3xl font-black">{countdown}</span>
                <span className="text-xs uppercase tracking-wider font-bold">{t.breatheOut}</span>
              </>
            )}
            {phase === 'done' && (
              <>
                <CheckCircle size={36} className="mx-auto mb-1" />
                <span className="text-xs font-bold uppercase tracking-wider">Peace Regained</span>
              </>
            )}
          </div>
        </div>

        {/* Cycle indicator */}
        {isActive && (
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-6">
            Cycle {cycle} of 3 • Deep Diaphragmatic Breaths
          </div>
        )}

        {/* Action Button */}
        {!isActive ? (
          <button
            onClick={startExercise}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wind size={18} />
            {t.startBreathing}
          </button>
        ) : (
          <button
            onClick={stopExercise}
            className="w-full py-3 px-6 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            {t.stopBreathing}
          </button>
        )}

        {/* Supportive Reminder */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs">
          <HeartHandshake size={14} />
          <span>You do not have to fight the craving. Just let it pass through you.</span>
        </div>
      </div>
    </div>
  );
};
