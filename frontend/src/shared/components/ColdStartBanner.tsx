import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';
import { subscribeColdStart } from '@/shared/api/coldStart';
import { useLocale } from '@/shared/i18n/LocaleContext';

export function ColdStartBanner() {
  const { t } = useLocale();
  const [waking, setWaking] = useState(false);

  useEffect(() => subscribeColdStart(setWaking), []);

  return (
    <AnimatePresence>
      {waking &&
      <motion.div
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -48, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        role="status"
        className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-afaaq-blue-900 px-4 py-2 text-center text-xs font-medium text-white">

          <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          {t('coldStart.waking')}
        </motion.div>
      }
    </AnimatePresence>);

}
