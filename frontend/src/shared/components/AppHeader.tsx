import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderIcon, LifeBuoyIcon, LogOutIcon, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { Logo } from '@/shared/components/Logo';
import { NotificationBell } from '@/features/notifications/NotificationBell';

function initialsOf(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function AppHeader() {
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-ink-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-shell items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-10">
        <Link to="/services" className="rounded-md shrink-0" aria-label={t('brand.name')}>
          <span className="sm:hidden">
            <Logo size={34} variant="mark" />
          </span>
          <span className="hidden sm:block">
            <Logo size={38} />
          </span>
        </Link>

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          {user?.role === 'ADMIN' &&
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-full border border-afaaq-blue/20 bg-afaaq-blue-50 px-3 py-2 text-xs font-semibold text-afaaq-blue transition-colors hover:border-afaaq-blue/40 sm:inline-flex">

              <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
              {t('nav.admin')}
            </Link>
          }
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface hover:text-afaaq-blue sm:inline-flex"
            aria-label="Support">

            <LifeBuoyIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <NotificationBell />
          <LanguageSwitcher />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={user?.fullName ?? ''}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-afaaq-blue-50 font-display text-sm font-bold text-afaaq-blue transition-transform hover:scale-105">

              {initialsOf(user?.fullName) || 'U'}
            </button>

            <AnimatePresence>
              {menuOpen &&
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute end-0 top-12 z-20 w-56 overflow-hidden rounded-card border border-ink-200/70 bg-white shadow-lift">

                  <div className="border-b border-ink-200/70 px-4 py-3">
                    <p className="truncate font-display text-sm font-bold text-ink-900">{user?.fullName}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/mon-dossier"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-start text-sm font-medium text-ink-700 transition-colors hover:bg-surface">

                    <FolderIcon className="h-4 w-4" aria-hidden="true" />
                    {t('nav.myDossier')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-start text-sm font-medium text-red-600 transition-colors hover:bg-red-50">

                    <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                    {t('nav.logout')}
                  </button>
                </motion.div>
              </>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>);

}
