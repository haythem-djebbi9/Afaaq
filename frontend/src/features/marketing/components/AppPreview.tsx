import { motion } from 'framer-motion';
import { CheckCircle2Icon, FileTextIcon, Loader2Icon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';

const rows = [
{ name: 'passeport_page1.pdf', done: true },
{ name: 'diplome_licence.pdf', done: true },
{ name: 'certificat_goethe_b1.jpg', done: false }];


export function AppPreview() {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative">
      
      <div className="overflow-hidden rounded-card border border-ink-200/70 bg-white shadow-lift">
        <div className="flex items-center gap-2 border-b border-ink-200/70 bg-surface px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="ms-3 rounded-full bg-white px-3 py-1 text-[10px] text-ink-500">
            afaaq-connect.tn/apply
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-ink-700">{t('form.stepOf', { a: 8, b: 9 })}</span>
            <span className="font-semibold text-afaaq-gold-600">89 % {t('form.completed')}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-200">
            <motion.div
              className="h-full rounded-full bg-afaaq-gold"
              initial={{ width: '18%' }}
              whileInView={{ width: '89%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }} />
            
          </div>

          <h3 className="mt-6 font-display text-sm font-bold text-ink-900">{t('step.documents')}</h3>

          <ul className="mt-4 flex flex-col gap-2.5">
            {rows.map((row, index) =>
            <motion.li
              key={row.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
              className="flex items-center gap-3 rounded-[10px] border border-ink-200 px-3.5 py-3">
              
                <FileTextIcon className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-900">{row.name}</span>
                {row.done ?
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('doc.uploaded')}
                  </span> :

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-afaaq-blue">
                    <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    {t('doc.uploading')}
                  </span>
              }
              </motion.li>
            )}
          </ul>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-7 -end-4 hidden rounded-card border border-ink-200/70 bg-white px-5 py-4 shadow-card sm:block">
        
        <p className="text-[10px] uppercase tracking-wider text-ink-500">{t('form.saved')}</p>
        <p className="mt-1 font-display text-sm font-bold text-afaaq-blue">14:32 · Tunis</p>
      </motion.div>
    </motion.div>);

}