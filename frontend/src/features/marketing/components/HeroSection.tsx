import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  MouseIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon } from
'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { Button } from '@/shared/components/ui/Button';
import { StatsRow } from '@/features/marketing/components/StatsRow';
import { heroBackground, stories } from '@/features/marketing/home.data';

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export function HeroSection() {
  const { t, dir } = useLocale();
  const arrow = `h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`;

  return (
    <section className="relative isolate overflow-hidden bg-afaaq-blue-900">
      {/*
        On phones/tablets the hero column is far taller than the 16:9 photo, so stretching
        it full-bleed with object-cover would show only a narrow vertical slice (~19% of the
        frame). Below lg the photo therefore gets its own 16:9 block above the copy, where it
        renders whole; from lg up the layout is wide enough for the original full-bleed look.
      */}
      <div className="relative lg:hidden">
        <img src={heroBackground} alt="" className="aspect-video w-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-afaaq-blue-900 via-afaaq-blue-900/35 to-transparent"
          aria-hidden="true" />
      </div>

      <motion.img
        src={heroBackground}
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover lg:block"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        aria-hidden="true" />

      <div
        className="absolute inset-0 hidden bg-gradient-to-r from-afaaq-blue-900/55 via-afaaq-blue-900/25 to-afaaq-blue-900/5 lg:block"
        aria-hidden="true" />
      <div
        className="absolute inset-0 hidden bg-gradient-to-t from-afaaq-blue-900/35 via-transparent to-transparent lg:block"
        aria-hidden="true" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,193,7,0.18),transparent_45%)]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true" />

      <motion.div
        className="absolute -top-44 -end-32 h-[540px] w-[540px] rounded-full border-[70px] border-white/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true" />

      {[
      { top: '18%', start: '6%', size: 6, duration: 4.5, delay: 0 },
      { top: '62%', start: '12%', size: 4, duration: 5.5, delay: 0.6 },
      { top: '38%', start: '30%', size: 5, duration: 5, delay: 1.1 },
      { top: '78%', start: '38%', size: 3, duration: 4, delay: 0.3 }].
      map((dot, index) =>
      <motion.span
        key={index}
        className="absolute hidden rounded-full bg-afaaq-gold/60 lg:block"
        style={{ top: dot.top, insetInlineStart: dot.start, width: dot.size, height: dot.size }}
        animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true" />

      )}

      <div className="relative mx-auto w-full max-w-shell px-6 pb-14 pt-16 lg:px-10 lg:pb-24 lg:pt-24">
        <motion.div variants={heroContainer} initial="hidden" animate="show" className="max-w-2xl">

          <motion.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
              <SparklesIcon className="h-3.5 w-3.5 text-afaaq-gold" aria-hidden="true" />
            </motion.span>
            {t('home.badge')}
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="mt-7 font-display text-[46px] font-extrabold leading-[1.04] text-white lg:text-[68px]">
            {t('home.title1')}
            <span className="relative block w-fit text-afaaq-gold">
              {t('home.title2')}
              <motion.span
                className="absolute -bottom-1 start-0 h-[3px] rounded-full bg-afaaq-gold"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }} />

            </span>
          </motion.h1>

          <motion.p variants={heroItem} className="mt-7 max-w-xl text-[15px] leading-7 text-white/75">{t('home.subtitle')}</motion.p>

          <motion.div variants={heroItem} className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="gold">
                {t('home.ctaPrimary')}
                <ArrowRightIcon className={arrow} aria-hidden="true" />
              </Button>
            </Link>
            <a
              href="#video"
              className="group inline-flex items-center gap-3 rounded-full border border-white/25 py-2 pe-6 ps-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-afaaq-blue transition-transform group-hover:scale-105">
                <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              {t('home.ctaSecondary')}
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={heroItem} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {stories.map((story) =>
                <img
                  key={story.id}
                  src={story.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-afaaq-blue-900" />

                )}
              </div>
              <div>
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((index) =>
                  <StarIcon key={index} className="h-3.5 w-3.5 fill-afaaq-gold text-afaaq-gold" />
                  )}
                </span>
                <p className="mt-1 text-xs text-white/70">{t('home.rating')}</p>
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs text-white/60">
              <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
              {t('home.trust')}
            </p>
          </motion.div>
        </motion.div>

        <div className="mt-16 border-t border-white/10 pt-10">
          <StatsRow />
        </div>

        <motion.p
          className="mt-12 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>

          <MouseIcon className="h-4 w-4" aria-hidden="true" />
          {t('home.scroll')}
        </motion.p>
      </div>
    </section>);

}
