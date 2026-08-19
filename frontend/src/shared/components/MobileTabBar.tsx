import { Link, useLocation } from 'react-router-dom';
import {
  FolderIcon,
  HomeIcon,
  LayoutGridIcon,
  LogInIcon,
  UserIcon } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';

interface Tab {
  to: string;
  labelKey: string;
  Icon: LucideIcon;
  /** Marks the tab active for nested routes too (e.g. /admin/:id). */
  match?: (pathname: string) => boolean;
}

const VISITOR_TABS: Tab[] = [
{ to: '/', labelKey: 'nav.home', Icon: HomeIcon },
{ to: '/#services', labelKey: 'nav.services', Icon: LayoutGridIcon },
{ to: '/signin', labelKey: 'nav.loginShort', Icon: LogInIcon },
{ to: '/signup', labelKey: 'nav.signupShort', Icon: UserIcon }];


const CLIENT_TABS: Tab[] = [
{ to: '/', labelKey: 'nav.home', Icon: HomeIcon },
{ to: '/services', labelKey: 'nav.services', Icon: LayoutGridIcon },
{
  to: '/mon-dossier',
  labelKey: 'nav.myDossier',
  Icon: FolderIcon,
  match: (p) => p.startsWith('/mon-dossier') || p.startsWith('/apply')
}];


export function MobileTabBar() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { pathname } = useLocation();

  // The wizard is a focused, multi-step flow — a persistent nav bar there competes with
  // its own Back/Next controls, so it stays out of the way.
  if (pathname.startsWith('/apply/')) return null;
  // Admins only have the candidates queue, which the header already links to.
  if (user?.role === 'ADMIN') return null;

  const tabs = user ? CLIENT_TABS : VISITOR_TABS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={t('nav.home')}>

      <ul className="mx-auto flex max-w-shell items-stretch">
        {tabs.map(({ to, labelKey, Icon, match }) => {
          const active = match ? match(pathname) : pathname === to.split('#')[0];
          const className = `flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors ${
          active ? 'text-afaaq-blue' : 'text-ink-500'}`;
          const inner =
          <>
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.4]' : ''}`} aria-hidden="true" />
              <span className="truncate">{t(labelKey)}</span>
            </>;


          return (
            <li key={to} className="flex-1">
              {/* In-page anchors need a real link so they scroll from any route. */}
              {to.includes('#') ?
              <a href={to} className={className}>
                  {inner}
                </a> :

              <Link to={to} aria-current={active ? 'page' : undefined} className={className}>
                  {inner}
                </Link>
              }
            </li>);

        })}
      </ul>
    </nav>);

}
