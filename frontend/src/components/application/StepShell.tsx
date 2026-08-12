import React from 'react';
import { InfoIcon } from 'lucide-react';
import { SectionHeading } from '../ui/Card';

interface Props {
  title: string;
  hint?: string;
  badge?: string;
  children: React.ReactNode;
}

export function StepShell({ title, hint, badge, children }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title={title} badge={badge} />
      {hint &&
      <p className="flex items-start gap-2.5 rounded-[10px] bg-afaaq-blue-50 px-4 py-3 text-[13px] leading-5 text-afaaq-blue">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {hint}
        </p>
      }
      {children}
    </div>);

}

interface RepeatableProps {
  index: number;
  onRemove?: () => void;
  removeLabel: string;
  children: React.ReactNode;
}

export function RepeatableRow({ index, onRemove, removeLabel, children }: RepeatableProps) {
  return (
    <div className="rounded-[10px] border border-ink-200 bg-surface/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-xs font-bold tracking-wide text-ink-500">
          #{String(index + 1).padStart(2, '0')}
        </span>
        {onRemove &&
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-ink-500 transition-colors hover:text-red-600">
          
            {removeLabel}
          </button>
        }
      </div>
      {children}
    </div>);

}