import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DynamicField } from './DynamicField';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import { RepeatableGroupField } from './RepeatableGroupField';
import { StepShell } from './StepShell';
import { useLocale } from '../../contexts/LocaleContext';
import { errorMessageAt } from '../../lib/formErrors';
import { buildStepDefaults, buildStepSchema } from '../../lib/zodFromConfig';
import type { DocumentRequirement } from '../../lib/applicationsApi';
import type { StepConfig } from '../../types/formConfig';

interface Props {
  step: StepConfig;
  data: Record<string, unknown>;
  documents?: DocumentRequirement[];
  onSubmit: (data: Record<string, unknown>) => void;
  formId: string;
}

export function DynamicStep({ step, data, documents, onSubmit, formId }: Props) {
  const { t } = useLocale();

  const schema = useMemo(
    () => buildStepSchema(step, { required: t('auth.error.required'), email: t('auth.error.email') }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step]
  );
  const defaults = useMemo(() => buildStepDefaults(step, data), [step, data]);

  const { register, control, handleSubmit, formState: { errors } } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: defaults
  });

  const scalarFields = (step.fields ?? []).filter((f) => f.kind === 'field');
  const repeatableFields = (step.fields ?? []).filter((f) => f.kind === 'repeatable');

  return (
    <StepShell title={t(step.titleKey)} hint={step.hintKey ? t(step.hintKey) : undefined}>
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {scalarFields.length > 0 &&
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {scalarFields.map((f) =>
          <DynamicField
            key={f.key}
            field={f}
            name={f.key}
            register={register}
            error={errorMessageAt(errors, f.key)} />

          )}
          </div>
        }

        {repeatableFields.map((f) =>
        <RepeatableGroupField key={f.key} config={f} control={control} register={register} errors={errors} />
        )}
      </form>

      {documents && documents.length > 0 &&
      <div className="flex flex-col gap-4">
          {documents.map((req) => <DocumentUploadSlot key={req.type} requirement={req} />)}
        </div>
      }
    </StepShell>);

}
