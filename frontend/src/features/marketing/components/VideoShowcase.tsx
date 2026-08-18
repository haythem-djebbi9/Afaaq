import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayIcon, XIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { videoPoster, videoSource } from '@/features/marketing/home.data';

export function VideoShowcase() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const content = (
    <>
      <span className="rounded-full bg-afaaq-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-afaaq-blue-900">
        {t('home.video.eyebrow')}
      </span>
      <h3 className="max-w-md font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-[28px]">
        {t('home.video.title')}
      </h3>
      <p className="max-w-md text-sm leading-6 text-white/80">{t('home.video.desc')}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-3 rounded-full bg-white py-2 pe-5 ps-2 text-sm font-semibold text-afaaq-blue transition-transform hover:scale-[1.03]">

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-afaaq-blue text-white">
          <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
        </span>
        {t('home.video.play')}
      </button>
    </>);


  return (
    <>
      <div className="overflow-hidden rounded-card shadow-lift">
        {/*
          A ratio matching the source photo (16:9) rather than a fixed pixel height: the
          previous h-[440px]/h-[540px] box forced object-cover to crop the poster to ~42%
          of the frame on phones. With aspect-video it renders whole at every width.
        */}
        <div className="relative aspect-video">
          <motion.img
            src={videoPoster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 6, ease: 'easeOut' }} />

          <div className="absolute inset-0 bg-afaaq-blue-900/40 sm:bg-afaaq-blue-900/55" aria-hidden="true" />

          {/* From sm up there is room to lay the copy over the image. */}
          <div className="absolute inset-0 hidden flex-col items-start justify-end gap-4 p-8 sm:flex lg:p-10">
            {content}
          </div>
        </div>

        {/* On phones the copy sits under the image so neither one is cropped. */}
        <div className="flex flex-col items-start gap-3 bg-afaaq-blue-900 p-6 sm:hidden">
          {content}
        </div>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-afaaq-blue-900/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={t('home.video.title')}
          onClick={() => setOpen(false)}>

            <motion.div
            className="relative w-full max-w-4xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}>

              <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-12 end-0 inline-flex items-center gap-2 text-sm font-semibold text-white">

                {t('home.video.close')}
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <video
              className="w-full rounded-card bg-black shadow-lift"
              src={videoSource}
              poster={videoPoster}
              controls
              autoPlay
              playsInline />

            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}
