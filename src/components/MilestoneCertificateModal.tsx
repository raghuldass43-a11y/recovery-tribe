import React from 'react';
import { X, Award, Share2, Sparkles } from 'lucide-react';
import { TranslationDictionary } from '../translations';
import confetti from 'canvas-confetti';

interface MilestoneCertificateModalProps {
  t: TranslationDictionary;
  name: string;
  daysClean: number;
  startDate?: string;
  onClose: () => void;
  onShareToFeed: (text: string) => void;
}

export const MilestoneCertificateModal: React.FC<MilestoneCertificateModalProps> = ({
  t,
  name,
  daysClean,
  startDate,
  onClose,
  onShareToFeed,
}) => {
  const handleShare = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    const shareMessage = `🏆 ${t.milestoneLabel} Honoring ${daysClean} ${t.daysCleanSuffix}! Every single day was won with courage and patience. Thank you RecoveryTribe for holding space for me. 🕊️✨`;
    onShareToFeed(shareMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border-4 border-amber-300 dark:border-amber-600/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X size={20} />
        </button>

        {/* Certificate Ornate Header */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800">
            <Award size={36} className="text-white drop-shadow-sm" />
          </div>
        </div>

        <div className="text-[10px] tracking-widest uppercase font-extrabold text-amber-600 dark:text-amber-400 mb-1">
          {t.certificateSubtitle}
        </div>
        <h2 className="text-2xl font-serif font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-4">
          {t.certificateTitle}
        </h2>

        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />

        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-2">
          {t.certificateAwardedTo}
        </p>

        {/* User Name */}
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 mb-3 font-serif">
          {name || "Valued Tribe Member"}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          {t.certificateDaysClean}
        </p>

        {/* Days Clean Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/50 mb-4 shadow-inner">
          <Sparkles size={18} className="text-amber-500 animate-spin" />
          <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300">
            {daysClean} {t.daysCleanSuffix}
          </span>
        </div>

        {startDate && (
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
            Journey began on: {new Date(startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}

        {/* Quote */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 mb-6">
          <p className="text-xs italic text-zinc-600 dark:text-zinc-300 leading-relaxed font-serif">
            {t.certificateQuote}
          </p>
        </div>

        {/* Share Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 size={16} />
            {t.downloadOrShare}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
