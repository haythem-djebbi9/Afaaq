import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { Logo } from '@/shared/components/Logo';
import { Button } from '@/shared/components/ui/Button';

const links = [
{ href: '#services', key: 'nav.services' },
{ href: '#how', key: 'nav.how' },
{ href: '#countries', key: 'nav.countries' },
{ href: '#stories', key: 'nav.stories' },
{ href: '#faq', key: 'home.faq.title' }];


export function MarketingHeader() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  return (
    <motion.header
      initial={{ y: -76, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-ink-200/60 bg-white">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-afaaq-gold"
        style={{ scaleX: progress }}
        aria-hidden="true" />

      <div className="mx-auto flex h-[76px] w-full max-w-shell items-center gap-4 px-5 sm:px-6 lg:gap-6 lg:px-8 xl:px-10">
        <Link to="/" aria-label={t('brand.name')} className="shrink-0">
          <Logo size={38} wordmarkClassName="text-[15px]" />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label={t('nav.services')}>
          {links.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="group relative whitespace-nowrap text-sm font-medium text-ink-700 transition-colors hover:text-afaaq-blue">

              {t(link.key)}
              <span className="absolute -bottom-1 start-0 h-[2px] w-0 bg-afaaq-gold transition-all duration-300 group-hover:w-full" aria-hidden="true" />
            </a>
          )}
        </nav>

        {/* Below lg these all live inside the menu panel instead — showing them next to the
            hamburger made the tablet header overflow and feel cluttered. */}
        <div className="ms-auto flex items-center gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <Link
            to="/signin"
            className="hidden whitespace-nowrap text-sm font-semibold text-afaaq-blue underline-offset-4 hover:underline lg:block">

            {t('nav.signin')}
          </Link>
          <Link to="/signup" className="hidden lg:block">
            <Button>{t('nav.start')}</Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 lg:hidden"
            aria-label={t('nav.services')}
            aria-expanded={open}>
            
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden border-t border-ink-200/60 bg-white lg:hidden">
          <div className="max-h-[calc(100vh-76px)] overflow-y-auto px-5 pb-6 pt-2">
            {/* Full-width rows: comfortable tap targets instead of small inline links. */}
            <nav className="flex flex-col">
              {links.map((link) =>
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-ink-200/60 py-4 text-[15px] font-medium text-ink-900 transition-colors active:text-afaaq-blue">

                  {t(link.key)}
                </a>
            )}
            </nav>

            {/* One primary action; sign-in stays a quiet text link so the panel reads calmly. */}
            <div className="mt-6 flex flex-col gap-4">
              <Link to="/signup" onClick={() => setOpen(false)}>
                <Button size="lg" fullWidth>{t('nav.start')}</Button>
              </Link>
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="text-center text-sm font-semibold text-afaaq-blue">

                {t('nav.signin')}
              </Link>
            </div>

            <div className="mt-6 flex justify-center border-t border-ink-200/60 pt-5">
              <LanguageSwitcher />
            </div>
          </div>
        </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

}