import React from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '../../contexts/LocaleContext';
import { useCountUp } from '../../hooks/useCountUp';
import { stats } from '../../data/home';

function Stat({ target, suffix, labelKey, index }: {target: number;suffix: string;labelKey: string;index: number;}) {
  const { t } = useLocale();
  const { ref, value } = useCountUp(target);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className="border-s border-white/10 ps-5 first:border-s-0 first:ps-0">

      <dd className="font-display text-[30px] font-extrabold leading-none text-white lg:text-[36px]">
        <span ref={ref}>{Math.round(value).toLocaleString('fr-FR')}</span>
        <span className="text-afaaq-gold">{suffix}</span>
      </dd>
      <dt className="mt-2 text-xs leading-5 text-white/60">{t(labelKey)}</dt>
    </motion.div>);

}

export function StatsRow() {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
      {stats.map((stat, index) =>
      <Stat key={stat.labelKey} target={stat.target} suffix={stat.suffix} labelKey={stat.labelKey} index={index} />
      )}
    </dl>);

}