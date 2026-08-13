import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';

interface Props {
  message: string | null;
}

export function Alert({ message }: Props) {
  return (
    <AnimatePresence initial={false}>
      {message &&
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="overflow-hidden">
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-5 text-red-700">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </div>
      </motion.div>
      }
    </AnimatePresence>);

}
