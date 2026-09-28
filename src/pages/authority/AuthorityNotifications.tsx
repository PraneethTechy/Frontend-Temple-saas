import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Ticket,
  Shield,
  Megaphone,
  Inbox,
} from 'lucide-react';
import {
  useGetAuthorityNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../store/api/authorityApi.js';
import type { Notification } from '@shared/types/index.js';

type FilterType = 'ALL' | 'UNREAD' | 'BOOKINGS' | 'SYSTEM';

interface NotificationClassification {
  type: 'BOOKING' | 'SYSTEM' | 'BROADCAST' | 'GENERAL';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface NotificationsPayload {
  notifications?: Notification[];
  unreadCount?: number;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

export const AuthorityNotifications: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const { data: notifsRes, isLoading, isError, error, refetch } = useGetAuthorityNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const rawData = notifsRes?.data;
  const notifications: Notification[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && typeof rawData === 'object' && 'notifications' in rawData) {
      return (rawData as NotificationsPayload).notifications || [];
    }
    return [];
  }, [rawData]);

  const unreadCount = useMemo(() => {
    if (rawData && typeof rawData === 'object' && 'unreadCount' in rawData && typeof (rawData as NotificationsPayload).unreadCount === 'number') {
      return (rawData as NotificationsPayload).unreadCount ?? 0;
    }
    return notifications.filter((n) => !n.isRead).length;
  }, [rawData, notifications]);

  const handleMarkOne = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markRead(id).unwrap();
    } catch {
      // noop
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      // noop
    }
  };

  // Classify notification type based on content
  const classifyNotif = (notif: Notification): NotificationClassification => {
    const text = ((notif.title || '') + ' ' + (notif.message || '')).toLowerCase();
    if (text.includes('booking') || text.includes('darshan') || text.includes('seva') || text.includes('pass')) {
      return { type: 'BOOKING', icon: Ticket, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (text.includes('security') || text.includes('password') || text.includes('login') || text.includes('admin')) {
      return { type: 'SYSTEM', icon: Shield, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
    if (text.includes('announcement') || text.includes('broadcast')) {
      return { type: 'BROADCAST', icon: Megaphone, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
    return { type: 'GENERAL', icon: Bell, color: 'text-spiritual-primary bg-spiritual-primaryLight border-spiritual-primaryRing/40' };
  };

  const filteredNotifications = useMemo(() => {
    if (filterType === 'UNREAD') return notifications.filter((n) => !n.isRead);
    if (filterType === 'BOOKINGS') return notifications.filter((n) => classifyNotif(n).type === 'BOOKING');
    if (filterType === 'SYSTEM') return notifications.filter((n) => classifyNotif(n).type === 'SYSTEM');
    return notifications;
  }, [notifications, filterType]);

  const getRelativeTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-spiritual-border border-t-spiritual-primary"></div>
        <p className="text-xs text-spiritual-muted animate-pulse">Loading temple alerts...</p>
      </div>
    );
  }

  const queryErr = error as ApiErrorResponse | undefined;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-spiritual-borderLight">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-spiritual-primaryLight/80 text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text">
              Temple Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-spiritual-primary text-white text-xs font-bold shadow-spiritual-xs">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-spiritual-muted mt-1 max-w-2xl">
            Live alerts, booking confirmations, supervisory notices, and administrative alerts for your temple.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-spiritual-border bg-white text-xs font-semibold text-spiritual-text hover:bg-spiritual-surface hover:border-spiritual-primary/40 transition-colors shadow-spiritual-xs disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-spiritual-primary" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {isError && (
        <div className="spiritual-card p-4 border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{queryErr?.data?.message || 'Failed to load notifications.'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-rose-700 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
            filterType === 'ALL'
              ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
              : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
            filterType === 'UNREAD'
              ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
              : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
          }`}
        >
          {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType('BOOKINGS')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
            filterType === 'BOOKINGS'
              ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
              : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
          }`}
        >
          Darshan & Sevas
        </button>

        <button
          onClick={() => setFilterType('SYSTEM')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
            filterType === 'SYSTEM'
              ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
              : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
          }`}
        >
          Security & Admin
        </button>
      </div>

      {/* Notifications List */}
      <div className="spiritual-card overflow-hidden divide-y divide-spiritual-border/60 border border-spiritual-border">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-spiritual-muted space-y-2">
            <div className="w-12 h-12 rounded-full bg-spiritual-surface flex items-center justify-center text-spiritual-primary/50 mx-auto border border-spiritual-borderLight">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-sm text-spiritual-text">No notifications found</p>
            <p className="max-w-xs mx-auto">
              {filterType === 'UNREAD'
                ? "You're all caught up! No unread notifications at this time."
                : 'Alerts and reservation activity for your temple will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const meta = classifyNotif(n);
            const Icon = meta.icon;

            return (
              <div
                key={n._id}
                onClick={() => (!n.isRead ? handleMarkOne(n._id) : null)}
                className={`p-4 flex items-start justify-between gap-4 transition-all ${
                  !n.isRead
                    ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-spiritual-primary cursor-pointer'
                    : 'hover:bg-spiritual-surface/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${meta.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-spiritual-text truncate">
                        {n.title || 'Temple Notification'}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-spiritual-primary shrink-0"></span>
                      )}
                    </div>

                    <p className="text-xs text-spiritual-muted mt-1 leading-relaxed whitespace-pre-line">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-spiritual-muted mt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {getRelativeTime(n.createdAt)}
                      </span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => handleMarkOne(n._id, e)}
                    className="shrink-0 p-1.5 text-spiritual-muted hover:text-spiritual-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-spiritual-border cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuthorityNotifications;
