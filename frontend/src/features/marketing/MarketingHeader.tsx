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
      className="sticky top-0 z-40 w-full border-b border-ink-200/60 bg-white/90 backdrop-blur">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-afaaq-gold"
        style={{ scaleX: progress }}
        aria-hidden="true" />

      <div className="mx-auto flex h-[76px] w-full max-w-shell items-center gap-8 px-6 lg:px-10">
        <Link to="/" aria-label={t('brand.name')} className="transition-transform hover:scale-105">
          <Logo size={54} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('nav.services')}>
          {links.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="group relative text-sm font-medium text-ink-700 transition-colors hover:text-afaaq-blue">

              {t(link.key)}
              <span className="absolute -bottom-1 start-0 h-[2px] w-0 bg-afaaq-gold transition-all duration-300 group-hover:w-full" aria-hidden="true" />
            </a>
          )}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link
            to="/signin"
            className="hidden text-sm font-semibold text-afaaq-blue underline-offset-4 hover:underline sm:block">
            
            {t('nav.signin')}
          </Link>
          <Link to="/signup" className="hidden sm:block">
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
          <div className="px-6 py-5">
            <nav className="flex flex-col gap-4">
              {links.map((link) =>
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink-700">

                  {t(link.key)}
                </a>
            )}
            </nav>
            <div className="mt-5 flex flex-col gap-3">
              <LanguageSwitcher />
              <Link to="/signin">
                <Button variant="secondary" fullWidth>
                  {t('nav.signin')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button fullWidth>{t('nav.start')}</Button>
              </Link>
            </div>
          </div>
        </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

}