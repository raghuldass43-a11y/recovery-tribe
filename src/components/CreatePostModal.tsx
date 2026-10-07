import React, { useState, useRef } from 'react';
import {
  X, ImagePlus, Sparkles, HeartHandshake, Award, Flame, MessageSquare,
  Smile, Hash, Video, Shield, EyeOff, Globe, Lock, Check, Camera as CameraIcon
} from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { PostCategory, User, RecoveryMood } from '../types';
import { isNativeAndroid, pickAndroidPhoto } from '../utils/androidBridge';

interface CreatePostModalProps {
  t: TranslationDictionary;
  currentUser: User;
  onClose: () => void;
  onSubmit: (
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
  ) => void;
  isEdit?: boolean;
  initialText?: string;
  initialImages?: string[];
  initialCategory?: PostCategory;
  defaultChallenge?: boolean;
  isAdmin?: boolean;
}

const MAX_POST_IMAGES = 6;

const RECOVERY_MOODS: { mood: RecoveryMood; emoji: string }[] = [
  { mood: 'Hopeful', emoji: '🌱' },
  { mood: 'Grateful', emoji: '🙏' },
  { mood: 'Strong', emoji: '💪' },
  { mood: 'Peaceful', emoji: '🧘' },
  { mood: 'Craving', emoji: '🌊' },
  { mood: 'Vulnerable', emoji: '🤍' },
];

const SUGGESTED_HASHTAGS = [
  '#100DaysClean',
  '#SoberLife',
  '#Day30',
  '#UrgeSurfing',
  '#OneDayAtATime',
  '#Grateful',
  '#Milestone',
  '#MindfulSobriety',
];

const MILESTONE_OPTIONS = [
  { label: 'None', value: 0 },
  { label: 'Day 1 (Courage)', value: 1 },
  { label: 'Day 3 (Detox Cleared)', value: 3 },
  { label: 'Day 7 (One Week Clean)', value: 7 },
  { label: 'Day 14 (Two Weeks)', value: 14 },
  { label: 'Day 30 (Bronze Chip)', value: 30 },
  { label: 'Day 60 (Two Months)', value: 60 },
  { label: 'Day 90 (Silver Serenity)', value: 90 },
  { label: 'Day 100 (Century Complete)', value: 100 },
  { label: '1 Year (Golden Milestone)', value: 365 },
];

function fileToCompressedDataURL(file: File, maxDim = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  t,
  currentUser,
  onClose,
  onSubmit,
  isEdit = false,
  initialText = "",
  initialImages = [],
  initialCategory = "general",
  defaultChallenge = false,
  isAdmin = false,
}) => {
  const [text, setText] = useState(initialText);
  const [images, setImages] = useState<string[]>(initialImages);
  const [category, setCategory] = useState<PostCategory>(
    isAdmin && defaultChallenge ? "challenge" : initialCategory === "challenge" && !isAdmin ? "general" : initialCategory
  );
  const [mood, setMood] = useState<RecoveryMood | ''>('Hopeful');
  const [milestoneDay, setMilestoneDay] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'tribe' | 'anonymous'>('public');
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_POST_IMAGES - images.length;
    const toProcess = files.slice(0, availableSlots);
    setLoadingImg(true);

    try {
      const converted = await Promise.all(toProcess.map(f => fileToCompressedDataURL(f)));
      setImages(prev => [...prev, ...converted]);
    } catch (err) {
      console.error(err);
    }
    setLoadingImg(false);
    e.target.value = "";
  };

  const handlePickMedia = async () => {
    if (isNativeAndroid()) {
      const photo = await pickAndroidPhoto();
      if (photo && images.length < MAX_POST_IMAGES) {
        setImages(prev => [...prev, photo]);
        return;
      }
    }
    fileInputRef.current?.click();
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const addHashtag = (tag: string) => {
    if (!text.includes(tag)) {
      setText(prev => (prev.trim() ? `${prev.trim()} ${tag} ` : `${tag} `));
    }
  };

  const canPost = text.trim().length > 0 || images.length > 0;
  const isChallenge = isAdmin && (category === "challenge" || defaultChallenge);

  const categories: { key: PostCategory; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: t.categoryGeneral, icon: <MessageSquare size={13} /> },
    ...(isAdmin ? [{ key: "challenge" as PostCategory, label: t.categoryChallenge, icon: <Flame size={13} /> }] : []),
    { key: "milestone", label: t.categoryMilestone, icon: <Award size={13} /> },
    { key: "support", label: t.categorySupport, icon: <HeartHandshake size={13} /> },
    { key: "gratitude", label: t.categoryGratitude, icon: <Sparkles size={13} /> },
  ];

  const handlePublish = () => {
    if (!canPost) return;

    // extract hashtags
    const foundTags = text.match(/#[a-zA-Z0-9_]+/g) || [];
    let finalText = text;
    if (videoUrl.trim()) {
      finalText += `\n\n🎥 Recovery Video: ${videoUrl.trim()}`;
    }

    onSubmit(finalText, images, category, isChallenge, {
      mood: mood || undefined,
      milestoneDay: milestoneDay > 0 ? milestoneDay : undefined,
      hashtags: Array.from(new Set(foundTags)),
      isAnonymous,
      privacy: isAnonymous ? 'anonymous' : privacy,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 select-none">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {isAnonymous ? '🛡️' : currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{isAnonymous ? "Anonymous Warrior" : currentUser.name}</span>
                {isAnonymous && (
                  <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.2 rounded font-semibold">
                    Hidden
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400">
                {isChallenge ? "100-Day Clean Journey Post" : "Share recovery reflection"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
          {/* Category Pill Switcher */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Pillar Category
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    category === cat.key
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recovery Mood Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Your Current Mood</span>
              {mood && <span className="text-orange-500 font-bold lowercase">#{mood}</span>}
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {RECOVERY_MOODS.map(m => (
                <button
                  key={m.mood}
                  type="button"
                  onClick={() => setMood(m.mood === mood ? '' : m.mood)}
                  className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    mood === m.mood
                      ? 'bg-amber-100 dark:bg-amber-950/40 border border-amber-400 text-amber-900 dark:text-amber-200'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.mood}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
              <Award size={12} className="text-amber-500" />
              <span>Attach Recovery Milestone</span>
            </label>
            <select
              value={milestoneDay}
              onChange={e => setMilestoneDay(Number(e.target.value))}
              className="w-full py-2 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {MILESTONE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Text Area */}
          <div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="How are you feeling today? Share your urges, reflections, gratitude, or victory..."
              rows={4}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-zinc-900 dark:text-zinc-100 resize-none leading-relaxed placeholder:text-zinc-400"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 mt-1">
              <span>{text.length} characters</span>
              <span>Keep it honest & respectful</span>
            </div>
          </div>

          {/* Hashtag Suggestions */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1.5">
              <Hash size={12} className="text-orange-500" />
              <span>Recovery Hashtags (Tap to add)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_HASHTAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addHashtag(tag)}
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition cursor-pointer ${
                    text.includes(tag)
                      ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-orange-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Video Link Input */}
          {showVideoInput && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                Video URL (YouTube or peer recovery video)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Uploaded Images Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-2xs">
                  <img src={img} alt="Post asset" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Anonymous & Privacy Settings */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-orange-500" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Post Anonymously
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Hides your real name and profile picture
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
              />
            </div>

            {!isAnonymous && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-zinc-500">Audience:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`py-1 px-2.5 rounded-lg font-bold text-[11px] transition ${
                      privacy === 'public'
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('tribe')}
                    className={`py-1 px-2.5 rounded-lg font-bold text-[11px] transition ${
                      privacy === 'tribe'
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    Tribe Only
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFiles}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handlePickMedia}
              disabled={images.length >= MAX_POST_IMAGES || loadingImg}
              className="p-2.5 text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer disabled:opacity-40"
              title="Add photos"
            >
              <ImagePlus size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowVideoInput(!showVideoInput)}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                showVideoInput
                  ? 'bg-orange-100 dark:bg-zinc-700 text-orange-600 dark:text-orange-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800'
              }`}
              title="Add video link"
            >
              <Video size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPost || loadingImg}
              className="py-2.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{isEdit ? "Update" : "Publish"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
