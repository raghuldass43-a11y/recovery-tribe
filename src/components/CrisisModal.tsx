import React, { useState } from 'react';
import { X, PhoneCall, ShieldAlert, Wind, Compass, HeartHandshake } from 'lucide-react';
import { TranslationDictionary } from '../translations';

interface CrisisModalProps {
  t: TranslationDictionary;
  onClose: () => void;
  onOpenUrgeSurfing: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ t, onClose, onOpenUrgeSurfing }) => {
  const [tab, setTab] = useState<'helpline' | 'grounding'>('helpline');

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X size={20} />
        </button>

        {/* Warning Banner */}
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-xs uppercase tracking-wider mb-2">
          <ShieldAlert size={18} />
          <span>Immediate Support & Helplines</span>
        </div>
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
          {t.crisisModalTitle}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {t.crisisModalIntro}
        </p>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-4">
          <button
            onClick={() => setTab('helpline')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'helpline'
                ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Hotlines & Call Centers
          </button>
          <button
            onClick={() => setTab('grounding')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'grounding'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
        </div>

        {tab === 'helpline' ? (
          <div className="space-y-4">
            {/* Urge Surfing Quick Launch */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Wind size={15} /> Experiencing a severe urge?
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Try 4-7-8 breathing to outlast the craving wave.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenUrgeSurfing();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                Breathe Now
              </button>
            </div>

            {/* India Helplines */}
            <div>
              <h4 className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                {t.crisisIndiaTitle}
              </h4>
              <div className="space-y-2">
                <a
                  href="tel:14416"
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:border-red-300 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Tele-MANAS (Govt of India 24/7)
                    </div>
                    <div className="text-[11px] text-zinc-500">Free mental health line in 20+ Indian languages</div>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-extrabold text-sm">
                    <PhoneCall size={16} /> 14416
                  </div>
                </a>

                <a
                  href="tel:18005990019"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      KIRAN Mental Health Helpline
                    </div>
                    <div className="text-[11px] text-zinc-500">Toll-free 24/7 national psychosocial support</div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-xs">
                    <PhoneCall size={14} /> 1800-599-0019
                  </div>
                </a>

                <a
                  href="tel:9999666555"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Vandrevala Foundation
                    </div>
                    <div className="text-[11px] text-zinc-500">Free 24/7 crisis and de-addiction helpline</div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-xs">
                    <PhoneCall size={14} /> 9999-666-555
                  </div>
                </a>

                <a
                  href="tel:08046110007"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      NIMHANS Helpline (Bengaluru)
                    </div>
                    <div className="text-[11px] text-zinc-500">National Institute of Mental Health & Neurosciences</div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-xs">
                    <PhoneCall size={14} /> 080-46110007
                  </div>
                </a>
              </div>
            </div>

            {/* US & International */}
            <div>
              <h4 className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                {t.crisisUsTitle}
              </h4>
              <div className="space-y-2">
                <a
                  href="tel:988"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      988 Suicide & Crisis Lifeline
                    </div>
                    <div className="text-[11px] text-zinc-500">Call or text 988 anytime (Free & confidential)</div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <PhoneCall size={14} /> 988
                  </div>
                </a>

                <a
                  href="tel:18006624357"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      SAMHSA National Helpline
                    </div>
                    <div className="text-[11px] text-zinc-500">Substance Abuse and Mental Health Services</div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <PhoneCall size={14} /> 1-800-662-4357
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* 5-4-3-2-1 Sensory Grounding */
          <div className="space-y-3 text-left">
            <div className="p-3 bg-amber-50 dark:bg-zinc-800/80 rounded-2xl border border-amber-200 dark:border-zinc-700">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mb-1">
                <Compass size={15} /> 5-4-3-2-1 Rapid Sensory Grounding
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                When panic or urges flood your mind, force your brain back into the present moment by naming:
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">5</span>
                <span><b>Things you can SEE</b> around you right now (a chair, light reflection, shoes, sky).</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">4</span>
                <span><b>Things you can physically TOUCH</b> (the cool floor under your feet, fabric of your shirt, cold water on wrists).</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">3</span>
                <span><b>Things you can HEAR</b> (birds, fan whirring, distant traffic, your own breath).</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">2</span>
                <span><b>Things you can SMELL</b> (fresh air, soap, tea, or your wrist).</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">1</span>
                <span><b>One positive truth</b> ("I am safe in this exact moment, and I am choosing freedom.")</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            <HeartHandshake size={14} />
            <span>Tribe Safe Harbor</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
