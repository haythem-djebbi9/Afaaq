import { PencilIcon } from 'lucide-react';
import { StepShell } from '@/features/applications/components/StepShell';
import { DocumentsSummary, FieldsSummary } from '@/features/applications/components/SectionSummary';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Checkbox } from '@/shared/components/ui/Field';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countries, services } from '@/shared/data/services';
import { stepInitialData } from '@/features/applications/stepDataMapping';
import type { DocumentRecord, DocumentRequirement } from '@/features/applications/applications.api';
import type { CountryCode, ServiceId } from '@/shared/types';
import type { FormConfig } from '@/shared/types/formConfig';

interface Props {
  service: ServiceId;
  country: CountryCode;
  config: FormConfig;
  stepData: Record<string, unknown>;
  requirements: DocumentRequirement[];
  documents: Record<string, DocumentRecord>;
  onEdit: (stepIndex: number) => void;
  declared: boolean;
  onDeclare: (value: boolean) => void;
  missingLabels: string[];
  submitError: string | null;
  submitting: boolean;
  onSubmit: () => void;
}

export function DynamicReview({
  service,
  country,
  config,
  stepData,
  requirements,
  documents,
  onEdit,
  declared,
  onDeclare,
  missingLabels,
  submitError,
  submitting,
  onSubmit
}: Props) {
  const { t, lang } = useLocale();
  const target = countries.find((c) => c.code === country)!;
  const svc = services.find((s) => s.id === service)!;

  return (
    <StepShell
      title={`${t('review.title')} — ${t(svc.titleKey)} · ${target.flag} ${target.name[lang]}`}
      hint={t('review.subtitle')}>

      <div className="flex flex-col gap-5">
        {config.steps.
        map((step, index) => ({ step, index })).
        filter(({ step }) => step.kind !== 'review').
        map(({ step, index }) =>
        <Card key={step.id} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink-900">{t(step.titleKey)}</h3>
              <button
              type="button"
              onClick={() => onEdit(index)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-afaaq-blue hover:underline">
                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {t('form.edit')}
              </button>
            </div>

            {step.kind === 'fields' &&
          <FieldsSummary step={step} data={stepInitialData(step, stepData)} />
          }
            {step.kind === 'fields' && step.documents && step.documents.length > 0 &&
          <div className="mt-4 border-t border-ink-200/70 pt-4">
                <DocumentsSummary
              requirements={requirements.filter((r) => r.step === 2)}
              documents={documents} />

              </div>
          }
            {step.kind === 'documents' &&
          <DocumentsSummary requirements={requirements.filter((r) => r.step === 8)} documents={documents} />
          }
          </Card>
        )}

        {missingLabels.length > 0 &&
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <p className="font-semibold">{t('newapp.missingDocuments')}</p>
            <ul className="mt-1.5 list-inside list-disc">
              {missingLabels.map((key) => <li key={key}>{t(key)}</li>)}
            </ul>
          </div>
        }

        {submitError &&
        <p className="text-center text-xs font-medium text-red-600">{t(submitError)}</p>
        }

        <Checkbox
          label={t('review.declaration')}
          checked={declared}
          onChange={(e) => onDeclare(e.target.checked)} />


        <div className="flex justify-end">
          <Button disabled={!declared || submitting} onClick={onSubmit}>
            {submitting ? t('newapp.submitting') : t('form.submit')}
          </Button>
        </div>
      </div>
    </StepShell>);

}
