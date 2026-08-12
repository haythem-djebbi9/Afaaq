import React from 'react';
import { CheckCircle2Icon, CircleDashedIcon } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import type { DocumentRecord, DocumentRequirement } from '../../lib/applicationsApi';
import type { FieldConfig, StepConfig } from '../../types/formConfig';

function formatValue(
  t: (key: string) => string,
  field: FieldConfig,
  raw: unknown,
  path: string,
  translations?: Record<string, string>,
  showOriginal?: boolean
): string {
  if (field.type === 'checkbox') return raw ? '✓' : '—';
  if (field.type === 'select') {
    const option = field.options?.find((o) => o.value === raw);
    return option ? t(option.labelKey) : String(raw || '—');
  }
  const value = typeof raw === 'string' ? raw.trim() : raw;
  if (!value) return '—';
  if (!showOriginal && translations?.[path]) return translations[path];
  return String(value);
}

interface FieldsSummaryProps {
  step: StepConfig;
  data: Record<string, unknown>;
  /** Admin-only: German translations of free-text values, keyed by dot-path (e.g. "personal.firstName" or "education.0.institution"). */
  translations?: Record<string, string>;
  /** Admin-only: when true, show the raw original text instead of the translation. */
  showOriginal?: boolean;
}

export function FieldsSummary({ step, data, translations, showOriginal }: FieldsSummaryProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-4">
      {(step.fields ?? []).map((f) => {
        if (f.kind === 'field') {
          const path = `${step.id}.${f.key}`;
          return (
            <div key={f.key} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-ink-500">{t(f.labelKey)}</span>
              <span className="font-medium text-ink-900">
                {formatValue(t, f, data[f.key], path, translations, showOriginal)}
              </span>
            </div>);

        }
        const rows = (data[f.key] as Record<string, unknown>[] | undefined) ?? [];
        return (
          <div key={f.key} className="flex flex-col gap-2">
            <span className="text-sm text-ink-500">{t(f.labelKey)}</span>
            {rows.length === 0 &&
            <p className="text-xs text-ink-500">{t('review.none')}</p>
            }
            {rows.map((row, index) =>
            <div key={index} className="rounded-[10px] border border-ink-200 bg-surface/60 p-3 text-xs">
                {f.fields.map((rf) => {
                const path = `${f.key}.${index}.${rf.key}`;
                return (
                  <div key={rf.key} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="text-ink-500">{t(rf.labelKey)}</span>
                      <span className="font-medium text-ink-900">
                        {formatValue(t, rf, row[rf.key], path, translations, showOriginal)}
                      </span>
                    </div>);

              })}
              </div>
            )}
          </div>);

      })}
    </div>);

}

interface DocumentsSummaryProps {
  requirements: DocumentRequirement[];
  documents: Record<string, DocumentRecord>;
}

export function DocumentsSummary({ requirements, documents }: DocumentsSummaryProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      {requirements.map((req) => {
        const uploaded = !!documents[req.type];
        return (
          <div key={req.type} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-700">{t(req.labelKey)}</span>
            {uploaded ?
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {t('doc.uploaded')}
              </span> :

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <CircleDashedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {req.required ? t('doc.missing') : t('form.optional')}
              </span>
            }
          </div>);

      })}
    </div>);

}
