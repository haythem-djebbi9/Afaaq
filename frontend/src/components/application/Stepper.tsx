import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

export interface StepDef {
  id: string;
  labelKey: string;
}

interface Props {
  steps: StepDef[];
  current: number;
  onSelect: (index: number) => void;
}

export function Stepper({ steps, current, onSelect }: Props) {
  const { t } = useLocale();

  return (
    <nav aria-label={t('form.stepOf', { a: current + 1, b: steps.length })}>
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < steps.length - 1 &&
              <span
                className={`absolute top-7 h-[calc(100%-1rem)] w-px start-[13px] ${
                done ? 'bg-afaaq-gold' : 'bg-ink-200'}`
                }
                aria-hidden="true" />

              }
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? 'step' : undefined}
                className="group flex flex-1 items-start gap-3 text-start">
                
                <span
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
                  done ?
                  'border-afaaq-gold bg-afaaq-gold text-afaaq-blue-900' :
                  active ?
                  'border-afaaq-blue bg-afaaq-blue text-white' :
                  'border-ink-200 bg-white text-ink-500'}`
                  }>
                  
                  {done ? <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={`pt-1 text-[13px] leading-5 transition-colors ${
                  active ?
                  'font-semibold text-afaaq-blue' :
                  done ?
                  'font-medium text-ink-700' :
                  'text-ink-500 group-hover:text-ink-700'}`
                  }>
                  
                  {t(step.labelKey)}
                </span>
              </button>
            </li>);

        })}
      </ol>
    </nav>);

}

interface ProgressProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressProps) {
  const { t } = useLocale();
  const percent = Math.round((current + 1) / total * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-700">
          {t('form.stepOf', { a: current + 1, b: total })}
        </span>
        <span className="font-semibold text-afaaq-gold-600">
          {percent}% {t('form.completed')}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}>
        
        <div
          className="h-full rounded-full bg-afaaq-gold transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }} />
        
      </div>
    </div>);

}