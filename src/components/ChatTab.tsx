import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Send, Plus, Users, Search, Smile, MessageCircle,
  ImagePlus, CheckCheck, ShieldAlert, MoreVertical, X, Award
} from 'lucide-react';
import { TranslationDictionary } from '../translations';
import { ChatMessage, User } from '../types';

interface ChatTabProps {
  t: TranslationDictionary;
  currentUser: User;
  users: Record<string, User>;
  messages: ChatMessage[];
  chatSeen: Record<string, number>;
  onSend: (to: string, text: string, image?: string) => void;
  onMarkSeen: (peer: string) => void;
  onBlockUser?: (email: string) => void;
  onReportUser?: (email: string) => void;
}

const QUICK_REACTIONS = ["🙏", "💪", "❤️", "🌟", "🕊️", "🔥"];

function fileToCompressedDataURL(file: File, maxDim = 800, quality = 0.7): Promise<string> {
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

export const ChatTab: React.FC<ChatTabProps> = ({
  t,
  currentUser,
  users,
  messages,
  chatSeen,
  onSend,
  onMarkSeen,
  onBlockUser,
  onReportUser,
}) => {
  const [activePeer, setActivePeer] = useState<string | null>(null); // 'community_circle' | peer email
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [chatCategory, setChatCategory] = useState<'all' | 'requests'>('all');
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group messages
  const circleMessages = messages
    .filter(m => m.to === 'community_circle')
    .sort((a, b) => a.timestamp - b.timestamp);

  const directMessages = messages.filter(
    m => m.to !== 'community_circle' && (m.author === currentUser.email || m.to === currentUser.email)
  );

  // Distinct conversations
  const conversations: Record<string, ChatMessage> = {};
  directMessages.forEach(m => {
    const peer = m.author === currentUser.email ? m.to : m.author;
    if (!peer) return;
    if (!conversations[peer] || conversations[peer].timestamp < m.timestamp) {
      conversations[peer] = m;
    }
  });

  const followingSet = new Set(currentUser.following || []);

  const conversationList = Object.entries(conversations)
    .map(([peer, lastMsg]) => ({
      peer,
      lastMsg,
      isRequest: !followingSet.has(peer) && lastMsg.author === peer,
    }))
    .sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp);

  const filteredConversations = conversationList.filter(c =>
    chatCategory === 'requests' ? c.isRequest : !c.isRequest
  );

  // Messages in active thread
  const threadMessages = activePeer === 'community_circle'
    ? circleMessages
    : activePeer
    ? directMessages.filter(
        m => (m.author === currentUser.email && m.to === activePeer) ||
             (m.author === activePeer && m.to === currentUser.email)
      ).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, activePeer, pendingImage]);

  const onMarkSeenRef = useRef(onMarkSeen);
  onMarkSeenRef.current = onMarkSeen;
  const lastMarkedPeerRef = useRef<string | null>(null);
  const lastMarkedCountRef = useRef<number>(-1);

  useEffect(() => {
    if (activePeer && (lastMarkedPeerRef.current !== activePeer || lastMarkedCountRef.current !== threadMessages.length)) {
      lastMarkedPeerRef.current = activePeer;
      lastMarkedCountRef.current = threadMessages.length;
      onMarkSeenRef.current(activePeer);
    }
  }, [activePeer, threadMessages.length]);

  const handleSend = () => {
    if ((!text.trim() && !pendingImage) || !activePeer) return;
    onSend(activePeer, text.trim(), pendingImage || undefined);
    setText("");
    setPendingImage(null);
  };

  const handleQuickReaction = (emoji: string) => {
    if (!activePeer) return;
    onSend(activePeer, emoji);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      setPendingImage(dataUrl);
    } catch (err) {
      console.error(err);
    }
    e.target.value = "";
  };

  const pickablePeers = Object.entries(users)
    .filter(([email]) => email !== currentUser.email && !(currentUser.blocked || []).includes(email))
    .filter(([_, u]) => !pickerQuery.trim() || (u.name || "").toLowerCase().includes(pickerQuery.toLowerCase()));

  // Active Thread View
  if (activePeer) {
    const isCircle = activePeer === 'community_circle';
    const peerUser = users[activePeer] || { name: activePeer, sobrietyDate: undefined };
    const peerDays = peerUser.sobrietyDate
      ? Math.max(0, Math.floor((Date.now() - new Date(peerUser.sobrietyDate).getTime()) / 86400000))
      : null;

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto relative">
        {/* Thread Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActivePeer(null);
                setShowMenu(false);
              }}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
            >
              <ArrowLeft size={20} className="text-zinc-700 dark:text-zinc-200" />
            </button>
            <div className="flex items-center gap-2.5">
              {isCircle ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                  <Users size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {peerUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight flex items-center gap-1.5">
                  <span>{isCircle ? t.communityCircle : peerUser.name}</span>
                  {!isCircle && peerDays !== null && (
                    <span className="text-[10px] bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Award size={10} />
                      {peerDays}d
                    </span>
                  )}
                </h4>
                <div className="text-[11px] text-zinc-400">
                  {isCircle ? "Tribe collective sanctuary" : "Encrypted peer chat"}
                </div>
              </div>
            </div>
          </div>

          {!isCircle && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1 z-30">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onReportUser?.(activePeer);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Report User
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onBlockUser?.(activePeer);
                      setActivePeer(null);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    Block User
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {threadMessages.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-xs">
              {t.noChatMessages}
              <div className="mt-1 text-[11px] text-zinc-500">{t.noChatMessagesSub}</div>
            </div>
          ) : (
            threadMessages.map(m => {
              const isMine = m.author === currentUser.email;
              const authorObj = users[m.author] || { name: m.authorName || m.author };

              return (
                <div
                  key={m.id}
                  className={`flex gap-2 items-end ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {authorObj.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[80%] ${isMine ? 'text-right' : 'text-left'}`}>
                    {!isMine && isCircle && (
                      <div className="text-[10px] font-bold text-zinc-400 mb-0.5 ml-1">
                        {authorObj.name}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words ${
                        isMine
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/60 rounded-bl-xs'
                      }`}
                    >
                      {m.image && (
                        <img
                          src={m.image}
                          alt="Shared attachment"
                          className="rounded-xl mb-1.5 max-h-48 object-cover w-full"
                        />
                      )}
                      {m.text}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-[10px] text-zinc-400 mt-0.5 px-1">
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck size={12} className="text-orange-500" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pending Image Attachment Preview */}
        {pendingImage && (
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-xs">
              <img src={pendingImage} alt="Attachment" className="w-full h-full object-cover" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute top-0 right-0 bg-black/70 text-white p-0.5 rounded-bl-lg"
              >
                <X size={12} />
              </button>
            </div>
            <span className="text-xs text-zinc-500">Image attached, tap send</span>
          </div>
        )}

        {/* Quick Reaction Bar */}
        <div className="flex gap-2 px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleQuickReaction(emoji)}
              className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-full text-sm hover:scale-110 transition shadow-2xs shrink-0 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Attach image"
          >
            <ImagePlus size={18} />
          </button>

          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={t.chatPlaceholder}
            className="flex-1 py-2.5 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() && !pendingImage}
            className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full shadow-sm hover:from-orange-600 hover:to-amber-700 transition disabled:opacity-40 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Conversation List View
  const circleLastMsg = circleMessages[circleMessages.length - 1];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Top Banner & New Chat */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
            {t.messagesTitle}
          </h3>
          <p className="text-[11px] text-zinc-400">
            Real-time peer connection & collective strength
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:from-orange-600 hover:to-amber-700 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>{t.newChatBtn}</span>
        </button>
      </div>

      {/* Tabs: Direct Chats vs Requests */}
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setChatCategory('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
            chatCategory === 'all'
              ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Conversations ({conversationList.filter(c => !c.isRequest).length})
        </button>
        <button
          onClick={() => setChatCategory('requests')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
            chatCategory === 'requests'
              ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Requests ({conversationList.filter(c => c.isRequest).length})
        </button>
      </div>

      {/* Community Circle Row */}
      {chatCategory === 'all' && (
        <div
          onClick={() => setActivePeer('community_circle')}
          className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-zinc-900 dark:to-zinc-900/60 border border-amber-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-amber-400 transition shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{t.communityCircle}</span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                  All
                </span>
              </h4>
              {circleLastMsg && (
                <span className="text-[10px] text-zinc-400">
                  {new Date(circleLastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {circleLastMsg ? `${circleLastMsg.authorName}: ${circleLastMsg.text}` : "Say hello to all warriors"}
            </p>
          </div>
        </div>
      )}

      {/* Peer Conversations List */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
            <MessageCircle size={32} className="text-zinc-300 mx-auto mb-2" />
            <h5 className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              {chatCategory === 'requests' ? "No pending message requests" : "No private chats yet"}
            </h5>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
              Reach out to any peer in the community. You are never alone on this journey.
            </p>
          </div>
        ) : (
          filteredConversations.map(({ peer, lastMsg }) => {
            const peerObj = users[peer] || { name: peer };
            const isUnread = (chatSeen[peer] || 0) < lastMsg.timestamp && lastMsg.author !== currentUser.email;

            return (
              <div
                key={peer}
                onClick={() => setActivePeer(peer)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  isUnread
                    ? "bg-orange-50/60 dark:bg-zinc-800/80 border-orange-200 dark:border-orange-900/50 shadow-xs"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                  {peerObj.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                      {peerObj.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {lastMsg.author === currentUser.email && <span className="text-zinc-400">You: </span>}
                      {lastMsg.text || "📷 Photo"}
                    </p>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0 ml-1.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat User Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Message a Recovery Peer
              </h4>
              <button
                onClick={() => {
                  setShowPicker(false);
                  setPickerQuery("");
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative my-3 shrink-0">
              <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
              <input
                value={pickerQuery}
                onChange={e => setPickerQuery(e.target.value)}
                placeholder="Search peers by name..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
              {pickablePeers.map(([email, u]) => (
                <div
                  key={email}
                  onClick={() => {
                    setActivePeer(email);
                    setShowPicker(false);
                    setPickerQuery("");
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-800/60 cursor-pointer transition border border-transparent hover:border-orange-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {u.name}
                    </h5>
                    <p className="text-[11px] text-zinc-400 truncate">{u.bio || "Tribe member"}</p>
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
