import React from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  MailCheck,
} from 'lucide-react';
import {
  useGetDevoteeNotificationsQuery,
  useMarkDevoteeNotificationReadMutation,
  useMarkAllDevoteeNotificationsReadMutation,
} from '../../store/api/devoteeApi.js';

export const Notifications = () => {
  const { data: notifRes, isLoading, isError, error, refetch } = useGetDevoteeNotificationsQuery();
  const [markRead] = useMarkDevoteeNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllDevoteeNotificationsReadMutation();

  const notifications = notifRes?.data?.notifications || [];
  const unreadCount = notifRes?.data?.unreadCount || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-spiritual-text flex items-center gap-2.5">
            <span>Devotee Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-spiritual-accent text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
            Stay updated with temple schedule announcements, seva updates, and account alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
            className="btn-spiritual-outline text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="spiritual-card p-12 text-center bg-white space-y-2 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin text-spiritual-primary mx-auto" />
          <p className="text-xs text-spiritual-muted">Loading notifications...</p>
        </div>
      )}

      {!isLoading && isError && (
        <div className="spiritual-card p-10 text-center bg-white border border-red-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-xs font-semibold text-spiritual-text">Failed to retrieve notifications</p>
          <p className="text-xs text-spiritual-muted">{error?.data?.message || 'Please retry.'}</p>
          <button onClick={() => refetch()} className="btn-spiritual-primary text-xs py-2 px-4">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && notifications.length === 0 && (
        <div className="spiritual-card p-14 text-center max-w-md mx-auto bg-white border border-spiritual-border rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-spiritual-surface text-spiritual-muted flex items-center justify-center mx-auto border border-spiritual-border">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-spiritual-text">No notifications.</h3>
          <p className="text-xs text-spiritual-muted leading-relaxed">
            You have no notifications at this time. We will alert you whenever your registered temples update timings or add new darshan sevas.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) markRead(notif._id);
              }}
              className={`spiritual-card p-5 bg-white border transition-all cursor-pointer flex items-start gap-4 rounded-2xl ${
                !notif.isRead
                  ? 'border-spiritual-primary/40 bg-spiritual-primaryLight/15 shadow-spiritual-sm'
                  : 'border-spiritual-border hover:bg-spiritual-surface/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !notif.isRead
                    ? 'bg-spiritual-primary text-white shadow-spiritual-sm'
                    : 'bg-spiritual-surface text-spiritual-muted'
                }`}
              >
                {!notif.isRead ? <Sparkles className="w-4 h-4" /> : <MailCheck className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-spiritual-primary' : 'text-spiritual-text'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-spiritual-subtle flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-spiritual-muted leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-spiritual-accent mt-2 shrink-0" title="Unread"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
