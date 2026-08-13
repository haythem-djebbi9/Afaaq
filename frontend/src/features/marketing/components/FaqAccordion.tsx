import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { faq } from '@/features/marketing/home.data';

export function FaqAccordion() {
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="flex flex-col gap-3">
      {faq.map((item, index) => {
        const expanded = open === index;
        return (
          <motion.li
            key={item.qKey}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
            className={`rounded-card border bg-white transition-colors ${
            expanded ? 'border-afaaq-blue/30 shadow-card' : 'border-ink-200/70'}`
            }>

            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : index)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 px-6 py-5 text-start">

                <span className="flex-1 font-display text-[15px] font-bold text-ink-900">
                  {t(item.qKey)}
                </span>
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0, backgroundColor: expanded ? '#0D47A1' : '#F2F4F7' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  expanded ? 'text-white' : 'text-ink-500'}`
                  }>

                  {expanded ?
                  <MinusIcon className="h-4 w-4" aria-hidden="true" /> :

                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  }
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden">
                
                  <p className="px-6 pb-6 text-sm leading-7 text-ink-500">{t(item.aKey)}</p>
                </motion.div>
              }
            </AnimatePresence>
          </motion.li>);

      })}
    </ul>);

}