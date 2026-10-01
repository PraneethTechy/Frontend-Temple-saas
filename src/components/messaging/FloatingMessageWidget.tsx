import React, { useState, useEffect, useRef, useMemo, type ReactElement } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Search,
  ArrowLeft,
  Shield,
  Loader2,
  CheckCheck,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks.js';
import {
  useGetUnreadMessageCountQuery,
  useGetConversationsQuery,
  useGetMyConversationQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from '../../store/api/messagesApi.js';
import type { IMessage, ConversationWithTemple } from '@shared/types/index.js';
import { getSocket } from '../../services/socketService.js';

// Clean time formatters
const formatMessageTime = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const FloatingMessageWidget = (): ReactElement | null => {
  const { isAppInitialized } = useAppSelector((state) => state.ui);
  const { user, isInitializing } = useAppSelector((state) => state.auth);

  // DEVOTEE EXCLUSION & INITIAL APP LOADING STATE:
  // Evaluated without breaking React Rules of Hooks (all hooks must run on every render)
  const isExcluded =
    !isAppInitialized ||
    isInitializing ||
    !user ||
    (user.role !== 'ADMIN' && user.role !== 'TEMPLE_AUTHORITY');

  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isAuthority = Boolean(user && user.role === 'TEMPLE_AUTHORITY');

  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAdminConversationId, setActiveAdminConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Real-time typing state
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unread badge query (polled every 8s to keep dot accurate across the entire layout)
  const { data: unreadData } = useGetUnreadMessageCountQuery(undefined, {
    pollingInterval: 8000,
    skip: isExcluded,
  });

  const unreadCount = unreadData?.data?.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  // RTK Query hooks
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markConversationRead] = useMarkConversationReadMutation();

  // Authority Direct Conversation Hook
  const {
    data: authorityData,
    isLoading: isAuthorityLoading,
    error: authorityError,
  } = useGetMyConversationQuery(undefined, {
    skip: isExcluded || !isAuthority || !isOpen,
    pollingInterval: isOpen && isAuthority ? 4000 : 0,
  });

  // Admin Conversations List Hook
  const {
    data: adminConversationsData,
    isLoading: isAdminListLoading,
  } = useGetConversationsQuery(undefined, {
    skip: isExcluded || !isAdmin || !isOpen,
    pollingInterval: isOpen && isAdmin && !activeAdminConversationId ? 4000 : 0,
  });

  // Admin Selected Conversation Messages Hook
  const {
    data: adminActiveConvData,
    isLoading: isAdminMessagesLoading,
  } = useGetConversationMessagesQuery(activeAdminConversationId || '', {
    skip: isExcluded || !isAdmin || !isOpen || !activeAdminConversationId,
    pollingInterval: isOpen && isAdmin && Boolean(activeAdminConversationId) ? 3000 : 0,
  });

  // Determine active conversation ID
  const activeConvId = isAuthority
    ? authorityData?.data?.conversation?._id
    : activeAdminConversationId;

  // Refs for auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom with instant and smooth capabilities
  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      if (smooth) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  };

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Mark read when authority opens panel
  useEffect(() => {
    if (isAuthority && isOpen && authorityData?.data?.conversation?._id) {
      const convId = authorityData.data.conversation._id;
      if (authorityData.data.conversation.unreadForAuthority > 0) {
        markConversationRead(convId);
      }
    }
  }, [isAuthority, isOpen, authorityData, markConversationRead]);

  // Mark read when admin opens a specific conversation
  useEffect(() => {
    if (isAdmin && isOpen && activeAdminConversationId && adminActiveConvData?.data?.conversation) {
      if (adminActiveConvData.data.conversation.unreadForAdmin > 0) {
        markConversationRead(activeAdminConversationId);
      }
    }
  }, [isAdmin, isOpen, activeAdminConversationId, adminActiveConvData, markConversationRead]);

  // Auto-scroll when messages or typing indicators update
  useEffect(() => {
    if (isOpen) {
      // Small timeout ensures DOM elements have rendered
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, authorityData?.data?.messages, adminActiveConvData?.data?.messages, isOtherTyping]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && (isAuthority || activeAdminConversationId)) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isAuthority, activeAdminConversationId]);

  // Socket.IO Room & Real-time Typing Event Listener
  useEffect(() => {
    if (isExcluded || !isOpen || !activeConvId) {
      setIsOtherTyping(false);
      return;
    }

    const socket = getSocket();

    // Join the scoped room for this conversation
    socket.emit('conversation:join', activeConvId);

    const handleTypingStart = (payload: { conversationId: string; senderId: string }) => {
      const currentUserId = (user as any)?._id || (user as any)?.id || (user as any)?.userId;
      if (payload.conversationId === activeConvId && payload.senderId !== currentUserId?.toString()) {
        setIsOtherTyping(true);
        setTimeout(() => scrollToBottom(true), 50);
      }
    };

    const handleTypingStop = (payload: { conversationId: string }) => {
      if (payload.conversationId === activeConvId) {
        setIsOtherTyping(false);
      }
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      // Clear active typing state on teardown or conversation change
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('typing:stop', { conversationId: activeConvId });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('conversation:leave', activeConvId);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      setIsOtherTyping(false);
    };
  }, [isOpen, activeConvId, user]);

  // Filtered Admin Conversations
  const filteredAdminConversations = useMemo(() => {
    const list = adminConversationsData?.data?.conversations || [];
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((conv: ConversationWithTemple) => {
      const name = conv.templeId?.name?.toLowerCase() || '';
      const city = conv.templeId?.city?.toLowerCase() || '';
      const state = conv.templeId?.state?.toLowerCase() || '';
      const lastMsg = conv.lastMessage?.toLowerCase() || '';
      return (
        name.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        lastMsg.includes(q)
      );
    });
  }, [adminConversationsData, searchQuery]);

  // Active messages list based on current active view
  const currentMessages: IMessage[] = isAuthority
    ? authorityData?.data?.messages || []
    : adminActiveConvData?.data?.messages || [];

  const currentConversation = isAuthority
    ? authorityData?.data?.conversation
    : adminActiveConvData?.data?.conversation;

  // Handle Input Changes with Typing Start / Stop Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (!activeConvId) return;

    if (val.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        getSocket().emit('typing:start', { conversationId: activeConvId });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        getSocket().emit('typing:stop', { conversationId: activeConvId });
      }, 1500);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        isTypingRef.current = false;
        getSocket().emit('typing:stop', { conversationId: activeConvId });
      }
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = messageInput.trim();
    if (!trimmed || isSending) return;

    const convId = isAuthority
      ? authorityData?.data?.conversation?._id
      : activeAdminConversationId;

    if (!convId) return;

    // Immediately stop typing indicator upon sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      getSocket().emit('typing:stop', { conversationId: convId });
    }

    try {
      setMessageInput('');
      await sendMessage({
        conversationId: convId,
        body: { message: trimmed },
      }).unwrap();
      setTimeout(() => scrollToBottom(true), 50);
    } catch {
      // Restore input on failure
      setMessageInput(trimmed);
    }
  };

  // Composer keydown (Enter to send, Shift+Enter for newline)
  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isExcluded) {
    return null;
  }

  return (
    <>
      {/* ========================================================
          1. PREMIUM FLOATING MESSAGE BUTTON (BOTTOM-RIGHT FIXED)
          ======================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close messages' : 'Open messages'}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDB] text-amber-900 border border-amber-300/70 ring-1 ring-amber-400/20 shadow-[0_8px_25px_-4px_rgba(180,83,9,0.22),0_4px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(180,83,9,0.32),0_6px_14px_-2px_rgba(0,0,0,0.08)] hover:scale-105 active:scale-95 transition-all duration-200 ease-out flex items-center justify-center cursor-pointer group focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-amber-500/25"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <X className="w-5 h-5 text-amber-900 stroke-[2.2] transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <MessageSquare className="w-[22px] h-[22px] text-amber-800 group-hover:text-amber-900 stroke-[2.2] transition-colors duration-200" />
          )}

          {/* Small Unread Notification Dot (Top-Right) */}
          {!isOpen && hasUnread && (
            <span
              className="absolute top-1.5 right-1.5 w-3 h-3 bg-amber-600 rounded-full ring-2 ring-white shadow-xs"
              title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
            />
          )}
        </div>
      </button>

      {/* ========================================================
          2. FLOATING MESSAGING PANEL
          ======================================================== */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="DevaSetu Messaging Center"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] md:w-[410px] h-[540px] max-h-[calc(100vh-7rem)] bg-white rounded-3xl border border-amber-200/90 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          {/* ======================================================
              VIEW A: TEMPLE AUTHORITY DIRECT ADMIN CHAT
              ====================================================== */}
          {isAuthority && (
            <div className="flex flex-col h-full bg-[#FAF6EE]">
              {/* Header (Top close button removed as floating FAB handles close) */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-serif font-bold text-amber-50 truncate tracking-wide">
                      Platform Administration
                    </h3>
                    <p className="text-[11px] text-amber-200/80 truncate">
                      DevaSetu Platform Team
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6EE] scrollbar-thin scrollbar-thumb-amber-200"
              >
                {isAuthorityLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                    <span className="text-xs font-medium">Loading messages...</span>
                  </div>
                ) : authorityError ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500">
                    <p className="text-xs">Unable to load messages. Please try again.</p>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-1">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-serif font-bold text-stone-800">
                      Start a conversation with DevaSetu Admin
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-[220px]">
                      Send queries regarding temple approval, seva timings, or platform support.
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg: IMessage) => {
                    const isFromAuthority = msg.senderRole === 'TEMPLE_AUTHORITY';
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isFromAuthority ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] font-semibold text-stone-400 mb-1 px-1">
                          {isFromAuthority ? 'You' : 'DevaSetu Admin'}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-2xs ${
                            isFromAuthority
                              ? 'bg-amber-600 text-white rounded-tr-xs'
                              : 'bg-white border border-stone-200/80 text-stone-800 rounded-tl-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400 font-mono">
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isFromAuthority && msg.readAt && (
                            <span title="Read">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Real-time Typing Indicator for Temple Authority */}
                {isOtherTyping && (
                  <div className="flex flex-col items-start pt-1 pb-1 animate-in fade-in duration-200">
                    <span className="text-[10px] font-semibold text-stone-400 mb-1 px-1">
                      DevaSetu Admin
                    </span>
                    <div className="bg-white border border-amber-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-xs flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
                      />
                      <span
                        className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
                      />
                      <span
                        className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom spacing anchor to guarantee full scroll visibility */}
                <div ref={messagesEndRef} className="h-4 shrink-0" />
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-amber-200/80 flex items-end gap-2 shrink-0"
              >
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Type a message to Admin... (Enter to send)"
                  rows={1}
                  disabled={isSending || isAuthorityLoading}
                  className="flex-1 max-h-24 min-h-[38px] p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending || isAuthorityLoading}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-200 text-white disabled:text-stone-400 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================================================
              VIEW B: PLATFORM ADMIN MULTI-TEMPLE MESSAGING
              ====================================================== */}
          {isAdmin && (
            <div className="flex flex-col h-full bg-[#FAF6EE]">
              {/* ADMIN SUB-VIEW 1: Conversation List */}
              {!activeAdminConversationId ? (
                <>
                  {/* Header (Top close button removed as floating FAB handles close) */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-200" />
                      <h3 className="text-sm font-serif font-bold text-amber-50 tracking-wide">
                        Temple Messages
                      </h3>
                      {hasUnread && (
                        <span className="ml-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="p-3 bg-white border-b border-amber-100 shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search temples..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-amber-100/60 bg-[#FAF6EE] scrollbar-thin scrollbar-thumb-amber-200">
                    {isAdminListLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        <span className="text-xs font-medium">Loading conversations...</span>
                      </div>
                    ) : filteredAdminConversations.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500">
                        <p className="text-xs">
                          {searchQuery
                            ? `No temples match "${searchQuery}"`
                            : 'No temple conversations available yet.'}
                        </p>
                      </div>
                    ) : (
                      filteredAdminConversations.map((conv: ConversationWithTemple) => {
                        const hasUnreadFromTemple = conv.unreadForAdmin > 0;
                        const temple = conv.templeId;
                        return (
                          <div
                            key={conv._id}
                            onClick={() => setActiveAdminConversationId(conv._id)}
                            className="p-3.5 hover:bg-amber-100/50 cursor-pointer transition-colors flex items-center gap-3 group"
                          >
                            {/* Temple Avatar */}
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0 font-serif font-bold text-sm shadow-2xs overflow-hidden">
                              {temple?.image ? (
                                <img
                                  src={temple.image}
                                  alt={temple.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>🛕</span>
                              )}
                            </div>

                            {/* Temple info & latest message */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4 className="text-xs font-serif font-bold text-stone-900 truncate">
                                  {temple?.name || 'Temple Authority'}
                                </h4>
                                <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                  {formatRelativeTime(conv.lastMessageAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 truncate">
                                {conv.lastMessage || 'No messages yet with this temple'}
                              </p>
                            </div>

                            {/* Unread dot / badge */}
                            {hasUnreadFromTemple && (
                              <div className="flex items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-amber-600 rounded-full ring-2 ring-white animate-pulse" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                /* ADMIN SUB-VIEW 2: Open Conversation with Specific Temple */
                <>
                  {/* Header with Back Button (Top close button removed as floating FAB handles close) */}
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveAdminConversationId(null)}
                        aria-label="Back to conversations list"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <h3 className="text-xs font-serif font-bold text-amber-50 truncate">
                          {currentConversation?.templeId?.name || 'Temple Authority'}
                        </h3>
                        {currentConversation?.templeId?.city && (
                          <p className="text-[10px] text-amber-200/80 truncate">
                            📍 {currentConversation.templeId.city}
                            {currentConversation.templeId.state ? `, ${currentConversation.templeId.state}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message List */}
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6EE] scrollbar-thin scrollbar-thumb-amber-200"
                  >
                    {isAdminMessagesLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        <span className="text-xs font-medium">Loading messages...</span>
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-1">
                          <span>🛕</span>
                        </div>
                        <h4 className="text-xs font-serif font-bold text-stone-800">
                          No messages with this temple yet
                        </h4>
                        <p className="text-[11px] text-stone-500 max-w-[220px]">
                          Send an administrative notice or update to this temple's authority.
                        </p>
                      </div>
                    ) : (
                      currentMessages.map((msg: IMessage) => {
                        const isFromAdmin = msg.senderRole === 'ADMIN';
                        return (
                          <div
                            key={msg._id}
                            className={`flex flex-col ${isFromAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] font-semibold text-stone-400 mb-1 px-1">
                              {isFromAdmin ? 'You (Admin)' : 'Temple Authority'}
                            </span>
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-2xs ${
                                isFromAdmin
                                  ? 'bg-amber-600 text-white rounded-tr-xs'
                                  : 'bg-white border border-stone-200/80 text-stone-800 rounded-tl-xs'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400 font-mono">
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isFromAdmin && msg.readAt && (
                                <span title="Read">
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Real-time Typing Indicator for Admin */}
                    {isOtherTyping && (
                      <div className="flex flex-col items-start pt-1 pb-1 animate-in fade-in duration-200">
                        <span className="text-[10px] font-semibold text-stone-400 mb-1 px-1">
                          Temple Authority
                        </span>
                        <div className="bg-white border border-amber-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-xs flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
                          />
                          <span
                            className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
                          />
                          <span
                            className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Bottom spacing anchor to guarantee full scroll visibility */}
                    <div ref={messagesEndRef} className="h-4 shrink-0" />
                  </div>

                  {/* Composer */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 bg-white border-t border-amber-200/80 flex items-end gap-2 shrink-0"
                  >
                    <textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Type a reply to authority... (Enter to send)"
                      rows={1}
                      disabled={isSending || isAdminMessagesLoading}
                      className="flex-1 max-h-24 min-h-[38px] p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || isSending || isAdminMessagesLoading}
                      aria-label="Send message"
                      className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-200 text-white disabled:text-stone-400 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingMessageWidget;
