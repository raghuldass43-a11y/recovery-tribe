import React from 'react';
import { X, Globe, Moon, Sun, LifeBuoy, Wind, Ban, RotateCcw, Smartphone, Download } from 'lucide-react';
import { TranslationDictionary } from '../translations';

interface SettingsModalProps {
  t: TranslationDictionary;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLang: () => void;
  onOpenCrisis: () => void;
  onOpenUrgeSurfing: () => void;
  onOpenBlocked: () => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  t,
  theme,
  onToggleTheme,
  onOpenLang,
  onOpenCrisis,
  onOpenUrgeSurfing,
  onOpenBlocked,
  onResetData,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            {t.settingsTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
          {/* Download APK Button */}
          <a
            href="/download/RecoveryTribe.apk"
            download="RecoveryTribe.apk"
            className="flex items-center justify-between py-2.5 px-3 mb-2 rounded-xl text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold transition shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Download size={16} />
              <span>Download RecoveryTribe.apk</span>
            </div>
            <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              385 KB
            </span>
          </a>

          {/* Android App Status */}
          <div className="flex items-center justify-between py-2.5 px-3 mb-2 rounded-xl text-xs bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-orange-800 dark:text-orange-300">
            <div className="flex items-center gap-2 font-medium">
              <Smartphone size={16} className="text-orange-500" />
              <span>Recovery Tribe Native Android</span>
            </div>
            <span className="font-mono text-[10px] bg-orange-200/70 dark:bg-orange-900/60 px-2 py-0.5 rounded-full font-bold">
              v1.0 APK
            </span>
          </div>

          {/* Language */}
          <div
            onClick={onOpenLang}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-orange-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.changeLanguage}</span>
            </div>
            <span className="text-xs text-zinc-400 font-bold">13 Indian Languages ›</span>
          </div>

          {/* Theme Toggle */}
          <div
            onClick={onToggleTheme}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-500" />
              ) : (
                <Moon size={18} className="text-indigo-500" />
              )}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.darkModeLabel}</span>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative ${
                theme === 'dark' ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>

          {/* Urge Surfing */}
          <div
            onClick={() => {
              onClose();
              onOpenUrgeSurfing();
            }}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <Wind size={18} className="text-emerald-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.urgeSurfingTitle}</span>
            </div>
            <span className="text-xs text-zinc-400">4-7-8 Tool ›</span>
          </div>

          {/* Crisis Hotline */}
          <div
            onClick={() => {
              onClose();
              onOpenCrisis();
            }}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <LifeBuoy size={18} className="text-red-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.crisisMenuLabel}</span>
            </div>
            <span className="text-xs text-red-500 font-bold">24/7 Support ›</span>
          </div>

          {/* Blocked Accounts */}
          <div
            onClick={onOpenBlocked}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <Ban size={18} className="text-zinc-400" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.blockedAccounts}</span>
            </div>
            <span className="text-xs text-zinc-400">›</span>
          </div>

          {/* Reset Demo Data */}
          <div
            onClick={onResetData}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={18} className="text-zinc-400" />
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Reload Sample Tribe Data</span>
            </div>
            <span className="text-[11px] text-zinc-400">Reset</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
};
