import { motion } from 'framer-motion';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
  tone?: 'dark' | 'light';
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'start', tone = 'dark' }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      
      {eyebrow &&
      <span
        className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] ${
        tone === 'light' ? 'text-afaaq-gold' : 'text-afaaq-blue'}`
        }>
        
          <span className="h-px w-6 bg-afaaq-gold" aria-hidden="true" />
          {eyebrow}
        </span>
      }
      <h2
        className={`mt-4 font-display text-[30px] font-bold leading-tight lg:text-[38px] ${
        tone === 'light' ? 'text-white' : 'text-ink-900'}`
        }>
        
        {title}
      </h2>
      {subtitle &&
      <p className={`mt-3 text-[15px] leading-7 ${tone === 'light' ? 'text-white/70' : 'text-ink-500'}`}>
          {subtitle}
        </p>
      }
    </motion.header>);

}