import { motion } from 'framer-motion';
import { BadgeCheckIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { partners } from '@/features/marketing/home.data';

export function PartnersMarquee() {
  const { t } = useLocale();
  const items = [...partners, ...partners];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full border-y border-ink-200/70 bg-white py-10">

      <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
        {t('home.partners.title')}
      </p>
      <div className="marquee-mask group mt-6 overflow-hidden" dir="ltr">
        <ul className="animate-marquee flex w-max items-center gap-12 group-hover:[animation-play-state:paused]">
          {items.map((name, index) =>
          <li
            key={`${name}-${index}`}
            className="flex shrink-0 items-center gap-2 font-display text-sm font-bold tracking-wide text-ink-500/80 transition-all duration-200 hover:scale-110 hover:text-afaaq-blue"
            aria-hidden={index >= partners.length}>

              <BadgeCheckIcon className="h-4 w-4 text-afaaq-gold" aria-hidden="true" />
              {name}
            </li>
          )}
        </ul>
      </div>
    </motion.section>);

}