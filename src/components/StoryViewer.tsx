import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Award, Sparkles, Heart } from 'lucide-react';
import { Story } from '../types';

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onSendReaction?: (story: Story, emoji: string) => void;
  onStoryViewed?: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex = 0,
  onClose,
  onSendReaction,
  onStoryViewed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const currentStoryId = currentStory?.id;

  const onStoryViewedRef = useRef(onStoryViewed);
  onStoryViewedRef.current = onStoryViewed;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const viewedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentStoryId) {
      onCloseRef.current();
      return;
    }
    if (!viewedIdsRef.current.has(currentStoryId)) {
      viewedIdsRef.current.add(currentStoryId);
      onStoryViewedRef.current?.(currentStoryId);
    }
    setProgress(0);
  }, [currentStoryId]);

  useEffect(() => {
    if (isPaused || !currentStoryId) return;

    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
          } else {
            onCloseRef.current();
          }
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex, currentStoryId, stories.length]);

  if (!currentStory) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const formattedTime = new Date(currentStory.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 select-none touch-none bg-black/95 max-w-md mx-auto"
      style={{
        background: currentStory.bg || 'linear-gradient(135deg, #ea580c, #c026d3)',
      }}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Segmented Progress Indicators */}
      <div>
        <div className="flex items-center gap-1.5 pt-safe mb-3">
          {stories.map((s, idx) => {
            let widthPct = 0;
            if (idx < currentIndex) widthPct = 100;
            else if (idx === currentIndex) widthPct = progress;
            return (
              <div key={s.id} className="flex-1 bg-white/30 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-75"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* User Info Bar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white text-orange-600 font-extrabold flex items-center justify-center text-sm shadow-md border-2 border-white/80">
              {currentStory.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold leading-tight">{currentStory.name}</span>
                {currentStory.milestone && (
                  <span className="text-[10px] bg-white/20 text-yellow-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <Award size={10} />
                    {currentStory.milestone}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/75">{formattedTime} • 24h Story</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition cursor-pointer"
            aria-label="Close Story"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Tap Left / Right Touch Overlay Controls */}
      <div className="absolute inset-0 top-20 bottom-24 flex z-10">
        <div
          className="w-1/3 h-full cursor-pointer active:bg-white/5 transition-colors"
          onClick={handlePrev}
          title="Previous Story"
        />
        <div className="w-1/3 h-full" />
        <div
          className="w-1/3 h-full cursor-pointer active:bg-white/5 transition-colors"
          onClick={handleNext}
          title="Next Story"
        />
      </div>

      {/* Main Story Content Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 text-yellow-300">
          <Sparkles size={24} />
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg leading-relaxed font-sans max-w-xs">
          "{currentStory.text}"
        </p>
      </div>

      {/* Quick Reaction Bottom Bar */}
      <div className="z-20 pb-safe">
        <div className="text-center text-[11px] text-white/70 font-semibold mb-2">
          Tap left/right to browse • Hold to pause
        </div>
        <div className="flex items-center justify-around gap-2 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          {["❤️", "🙏", "💪", "🕊️", "🔥", "✨"].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onSendReaction?.(currentStory, emoji);
                onClose();
              }}
              className="p-2 hover:bg-white/20 active:scale-125 rounded-full text-xl transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
