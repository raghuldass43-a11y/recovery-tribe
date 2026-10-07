import React from 'react';
import { X, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { User } from '../types';

interface FollowersModalProps {
  t: TranslationDictionary;
  title: string;
  emails: string[];
  users: Record<string, User>;
  currentUser: User;
  onToggleFollow: (email: string) => void;
  onStartChat: (email: string) => void;
  onClose: () => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  t,
  title,
  emails,
  users,
  currentUser,
  onToggleFollow,
  onStartChat,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            {title} ({emails.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 py-2">
          {emails.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400">
              No peers to display yet.
            </div>
          ) : (
            emails.map(email => {
              const u = users[email] || { name: email, bio: "" };
              const isFollowing = (currentUser.following || []).includes(email);
              const isSelf = email === currentUser.email;

              return (
                <div key={email} className="flex items-center justify-between py-3 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                        {u.bio || email}
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onStartChat(email);
                          onClose();
                        }}
                        className="p-2 text-zinc-500 hover:text-orange-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        title="Direct Message"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => onToggleFollow(email)}
                        className={`py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isFollowing
                            ? 'border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck size={12} />
                            <span>{t.followingBtn}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            <span>{t.followBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
