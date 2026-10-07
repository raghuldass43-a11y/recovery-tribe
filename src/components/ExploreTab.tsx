import React, { useState } from 'react';
import {
  Search, Hash, Users, Sparkles, Flame, Wind, LifeBuoy,
  BookOpen, ChevronRight, Check, HeartHandshake, TrendingUp
} from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { Post, User, SupportGroup } from '../types';

interface ExploreTabProps {
  t: TranslationDictionary;
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  groups: SupportGroup[];
  onToggleFollow: (email: string) => void;
  onJoinGroup: (groupId: string) => void;
  onSelectHashtag: (tag: string) => void;
  onOpen100DayHub: () => void;
  onOpenUrgeSurfing: () => void;
  onOpenCrisis: () => void;
  onOpenPostComments: (postId: string) => void;
}

const RECOVERY_HASHTAGS = [
  '#100DaysClean',
  '#SoberLife',
  '#Day30',
  '#UrgeSurfing',
  '#OneDayAtATime',
  '#Grateful',
  '#Milestone',
  '#MindfulSobriety',
];

const TRENDING_TOPICS = [
  {
    title: 'Surviving Evening Cravings',
    postsCount: '34 shares',
    desc: 'How warriors swap the 7 PM habitual urge with herbal tea, showers & deep breathwork.',
  },
  {
    title: 'Dopamine Reset in Days 1-30',
    postsCount: '28 shares',
    desc: 'Why sleep feels weird at first and when genuine morning energy returns.',
  },
  {
    title: '100-Day Clean Challenge',
    postsCount: '52 shares',
    desc: 'Daily stepping stone accountability led by community organizer.',
  },
  {
    title: 'Rebuilding Trust with Family',
    postsCount: '19 shares',
    desc: 'Living amends: Actions speak louder than apologies in recovery.',
  },
];

const RECOMMENDED_READS = [
  {
    title: 'The 20-Minute Urge Rule',
    category: 'Relapse Prevention',
    summary: 'Cravings are biological surges that peak in 15 minutes and dissipate naturally.',
    icon: '🌊',
  },
  {
    title: 'Somatic Grounding (5-4-3-2-1)',
    category: 'Anxiety Relief',
    summary: 'Engage your five senses to immediately pull your mind out of alcohol cravings.',
    icon: '🧘',
  },
  {
    title: 'Sleep Hygiene After Alcohol',
    category: 'Health Recovery',
    summary: 'Restoring REM sleep cycles naturally without sedatives or alcohol.',
    icon: '🌙',
  },
];

export const ExploreTab: React.FC<ExploreTabProps> = ({
  t,
  currentUser,
  users,
  posts,
  groups,
  onToggleFollow,
  onJoinGroup,
  onSelectHashtag,
  onOpen100DayHub,
  onOpenUrgeSurfing,
  onOpenCrisis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'groups' | 'topics' | 'reads'>('all');

  const followingSet = new Set(currentUser.following || []);
  const userGroupsSet = new Set(currentUser.groups || []);

  const trimmed = searchQuery.trim().toLowerCase();

  // Search Results
  const matchedUsers = trimmed
    ? Object.entries(users).filter(([email, u]) => {
        if (email === currentUser.email) return false;
        const name = (u.name || '').toLowerCase();
        const bio = (u.bio || '').toLowerCase();
        return name.includes(trimmed) || bio.includes(trimmed);
      })
    : [];

  const matchedPosts = trimmed
    ? posts.filter(p => {
        const text = (p.text || '').toLowerCase();
        const mood = (p.mood || '').toLowerCase();
        const tags = (p.hashtags || []).map(tg => tg.toLowerCase()).join(' ');
        return text.includes(trimmed) || mood.includes(trimmed) || tags.includes(trimmed);
      })
    : [];

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto">
      {/* Search Input Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-3 text-zinc-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search peers, recovery tags (#Day30), posts..."
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-xs text-zinc-400 font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* When actively searching */}
      {trimmed ? (
        <div className="space-y-4">
          {/* Matched Peers */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              Peers ({matchedUsers.length})
            </h4>
            {matchedUsers.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No members matching "{searchQuery}"</p>
            ) : (
              <div className="space-y-2">
                {matchedUsers.map(([email, u]) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {u.name}
                        </h5>
                        <p className="text-[11px] text-zinc-400 truncate">{u.bio || "Recovery warrior"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleFollow(email)}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
                        followingSet.has(email)
                          ? "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                          : "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs"
                      }`}
                    >
                      {followingSet.has(email) ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matched Posts */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              Recovery Posts ({matchedPosts.length})
            </h4>
            {matchedPosts.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No posts found with this query</p>
            ) : (
              <div className="space-y-2.5">
                {matchedPosts.map(p => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{p.authorName}</span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(p.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default Explore View */
        <div className="space-y-5">
          {/* Recovery Hashtags Cloud */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Hash size={14} className="text-orange-500" />
                <span>Recovery Hashtags</span>
              </h4>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {RECOVERY_HASHTAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    onSelectHashtag(tag);
                  }}
                  className="py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-400 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs shrink-0 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpen100DayHub}
              className="p-3 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-zinc-800 rounded-2xl text-center hover:scale-102 transition"
            >
              <Flame size={20} className="mx-auto mb-1 text-orange-500" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">100-Day Hub</div>
              <div className="text-[10px] text-zinc-400">Streak Journey</div>
            </button>

            <button
              onClick={onOpenUrgeSurfing}
              className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-zinc-800 rounded-2xl text-center hover:scale-102 transition"
            >
              <Wind size={20} className="mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Urge Surfing</div>
              <div className="text-[10px] text-zinc-400">4-7-8 Relief</div>
            </button>

            <button
              onClick={onOpenCrisis}
              className="p-3 bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-200 dark:border-zinc-800 rounded-2xl text-center hover:scale-102 transition"
            >
              <LifeBuoy size={20} className="mx-auto mb-1 text-rose-500" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Helpline</div>
              <div className="text-[10px] text-zinc-400">Free 24/7 SOS</div>
            </button>
          </div>

          {/* Peer Support Groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Users size={14} className="text-orange-500" />
                <span>Support Groups</span>
              </h4>
              <span className="text-[11px] text-zinc-400">Join to connect</span>
            </div>

            <div className="space-y-2">
              {groups.map(group => {
                const isMember = userGroupsSet.has(group.id);
                return (
                  <div
                    key={group.id}
                    className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                        {group.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {group.name}
                          </h5>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{group.description}</p>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                          {group.membersCount} members
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onJoinGroup(group.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        isMember
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                      }`}
                    >
                      {isMember ? 'Joined ✓' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Recovery Topics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-orange-500" />
                <span>Trending Recovery Discussions</span>
              </h4>
            </div>

            <div className="space-y-2">
              {TRENDING_TOPICS.map((topic, idx) => (
                <div
                  key={idx}
                  onClick={() => setSearchQuery(topic.title)}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-orange-300 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {topic.title}
                    </span>
                    <span className="text-[10px] font-semibold text-orange-500">{topic.postsCount}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {topic.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Recovery Articles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <BookOpen size={14} className="text-orange-500" />
                <span>Recommended Recovery Wisdom</span>
              </h4>
            </div>

            <div className="space-y-2">
              {RECOMMENDED_READS.map((read, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                    {read.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{read.title}</h5>
                      <span className="text-[9px] uppercase tracking-wider bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.2 rounded font-bold">
                        {read.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{read.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
