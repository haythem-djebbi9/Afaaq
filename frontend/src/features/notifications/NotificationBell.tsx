import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification } from
'@/features/notifications/notifications.api';

function notificationText(t: (key: string, vars?: Record<string, string>) => string, n: AppNotification) {
  const meta = (n.meta ?? {}) as {section?: string;};
  const section = meta.section ? t(`step.${meta.section}`) : '';
  return t(n.message, section ? { section } : undefined);
}

export function NotificationBell() {
  const { t } = useLocale();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    if (!token) return;
    try {
      const res = await listNotifications(token);
      setItems(res.items);
      setUnreadCount(res.unreadCount);
    } catch {
      // silent — notifications are non-critical
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) void load();
  };

  const handleClick = async (n: AppNotification) => {
    if (!token) return;
    if (!n.read) {
      await markNotificationRead(token, n.id);
      setItems((prev) => prev.map((it) => it.id === n.id ? { ...it, read: true } : it));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    setItems((prev) => prev.map((it) => ({ ...it, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-expanded={open}
        className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface hover:text-afaaq-blue sm:inline-flex"
        aria-label={t('notif.title')}>

        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 &&
        <span className="absolute end-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-afaaq-gold px-1 text-[10px] font-bold text-afaaq-blue-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        }
      </button>

      <AnimatePresence>
        {open &&
        <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute end-0 top-12 z-20 w-80 overflow-hidden rounded-card border border-ink-200/70 bg-white shadow-lift">

              <div className="flex items-center justify-between border-b border-ink-200/70 px-4 py-3">
                <p className="font-display text-sm font-bold text-ink-900">{t('notif.title')}</p>
                {unreadCount > 0 &&
              <button
                type="button"
                onClick={() => void handleMarkAll()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-afaaq-blue hover:underline">
                    <CheckCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('notif.markAllRead')}
                  </button>
              }
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 &&
              <p className="px-4 py-6 text-center text-xs text-ink-500">{t('notif.empty')}</p>
              }
                {items.map((n) =>
              <button
                key={n.id}
                type="button"
                onClick={() => void handleClick(n)}
                className={`flex w-full flex-col gap-0.5 border-b border-ink-200/50 px-4 py-3 text-start text-xs transition-colors last:border-b-0 hover:bg-surface ${
                n.read ? 'text-ink-500' : 'bg-afaaq-blue-50/40 font-medium text-ink-900'}`
                }>

                    <span>{notificationText(t, n)}</span>
                    <span className="text-[11px] text-ink-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </button>
              )}
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}
