import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/shared/components/Logo';

interface Props {
  /** Called once the splash has been shown long enough to dismiss itself. */
  onFinish: () => void;
  durationMs?: number;
}

export function SplashScreen({ onFinish, durationMs = 1600 }: Props) {
  useEffect(() => {
    const handle = setTimeout(onFinish, durationMs);
    return () => clearTimeout(handle);
  }, [onFinish, durationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
      role="status"
      aria-label="AFAAQ CONNECT">

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>

        <span className="sm:hidden">
          <Logo size={148} />
        </span>
        <span className="hidden sm:block">
          <Logo size={196} />
        </span>
      </motion.div>

      {/* Thin brand-gold progress bar, sized to the loading window. */}
      <div className="mt-10 h-[3px] w-40 overflow-hidden rounded-full bg-afaaq-blue/10">
        <motion.div
          className="h-full rounded-full bg-afaaq-gold"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: durationMs / 1000, ease: 'easeInOut' }} />

      </div>
    </motion.div>);

}
