import { motion } from 'framer-motion';

interface Props {
  onFinish?: () => void;
}

const brand = 'AFAAQ'.split('');
const accent = 'CONNECT'.split('');

const letter = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.9 + i * 0.045, ease: 'easeOut' }
  })
};

export function LoadingScreen({ onFinish }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-afaaq-blue-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      onAnimationComplete={() => {}}
      role="status"
      aria-label="Loading AFAAQ CONNECT">

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,193,7,0.16),transparent_55%)]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true" />

      {/* Decorative rotating rings */}
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true" />
      <motion.div
        className="absolute h-[320px] w-[320px] rounded-full border border-dashed border-afaaq-gold/25"
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true" />

      {/* Floating particles */}
      {[
      { top: '22%', start: '30%', size: 5, duration: 3.6, delay: 0.1 },
      { top: '68%', start: '26%', size: 4, duration: 4.4, delay: 0.5 },
      { top: '32%', start: '68%', size: 3, duration: 3.2, delay: 0.9 },
      { top: '72%', start: '70%', size: 6, duration: 4, delay: 0.3 }].
      map((dot, index) =>
      <motion.span
        key={index}
        className="absolute rounded-full bg-afaaq-gold/70"
        style={{ top: dot.top, insetInlineStart: dot.start, width: dot.size, height: dot.size }}
        animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true" />

      )}

      <div className="relative flex flex-col items-center">
        {/* Mark */}
        <motion.div
          className="relative flex h-28 w-28 items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}>

          <motion.span
            className="absolute inset-0 rounded-full bg-afaaq-gold/20 blur-xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true" />

          <svg width={88} height={88} viewBox="0 0 48 48" role="img" aria-label="AFAAQ CONNECT">
            <motion.path
              d="M24 4.5c1.6 0 3.1.85 3.9 2.24l14.3 24.8a4.5 4.5 0 1 1-7.8 4.5L24 17.6 13.6 36.04a4.5 4.5 0 1 1-7.8-4.5l14.3-24.8A4.5 4.5 0 0 1 24 4.5Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }} />
            <motion.path
              d="M24 4.5c1.6 0 3.1.85 3.9 2.24l14.3 24.8a4.5 4.5 0 1 1-7.8 4.5L24 17.6 13.6 36.04a4.5 4.5 0 1 1-7.8-4.5l14.3-24.8A4.5 4.5 0 0 1 24 4.5Z"
              fill="#FFFFFF"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.05, ease: 'easeOut' }} />
            <motion.path
              d="M22.2 34.6c.7-5.6 1.7-9.7 3.6-13.1l2.1 1.6c-1.5 3.3-2.2 7.1-2.3 11.5h-3.4Z"
              fill="#FFC107"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 1.25, ease: 'backOut' }}
              style={{ transformOrigin: '25px 28px' }} />
            <motion.circle
              cx={26.9}
              cy={17.9}
              r={1.9}
              fill="#FFC107"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.6, 1] }}
              transition={{ duration: 0.5, delay: 1.35, ease: 'easeOut' }} />
          </svg>
        </motion.div>

        {/* Wordmark */}
        <div className="mt-6 flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-[0.16em]">
          <span className="flex" aria-hidden="true">
            {brand.map((char, i) =>
            <motion.span key={`b-${i}`} custom={i} variants={letter} initial="hidden" animate="show" className="text-white">
              {char}
            </motion.span>
            )}
          </span>
          <span className="flex" aria-hidden="true">
            {accent.map((char, i) =>
            <motion.span
              key={`c-${i}`}
              custom={i + brand.length}
              variants={letter}
              initial="hidden"
              animate="show"
              className="text-afaaq-gold">
              {char}
            </motion.span>
            )}
          </span>
          <span className="sr-only">AFAAQ CONNECT</span>
        </div>

        {/* Progress bar */}
        <div className="mt-7 h-[3px] w-40 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-afaaq-gold"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.9, delay: 0.2, ease: 'easeInOut' }}
            onAnimationComplete={onFinish} />
        </div>

        <motion.p
          className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}>
          Votre avenir en Europe
        </motion.p>
      </div>
    </motion.div>);

}
