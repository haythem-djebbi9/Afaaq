import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';
import { DynamicField } from '@/features/applications/components/DynamicField';
import { RepeatableRow } from '@/features/applications/components/StepShell';
import { Button } from '@/shared/components/ui/Button';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { errorMessageAt } from '@/features/applications/formErrors';
import { emptyRowFor } from '@/features/applications/zodFromConfig';
import type { RepeatableFieldConfig } from '@/shared/types/formConfig';

interface Props {
  config: RepeatableFieldConfig;
  control: Control<Record<string, unknown>>;
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
}

export function RepeatableGroupField({ config, control, register, errors }: Props) {
  const { t } = useLocale();
  const { fields, append, remove } = useFieldArray({ control, name: config.key as never });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((item, index) =>
      <RepeatableRow
        key={item.id}
        index={index}
        removeLabel={t('form.remove')}
        onRemove={fields.length > config.minItems ? () => remove(index) : undefined}>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {config.fields.map((f) =>
          <DynamicField
            key={f.key}
            field={f}
            name={`${config.key}.${index}.${f.key}`}
            register={register}
            error={errorMessageAt(errors, `${config.key}.${index}.${f.key}`)} />

          )}
          </div>
        </RepeatableRow>
      )}

      <div>
        <Button type="button" variant="secondary" onClick={() => append(emptyRowFor(config.fields))}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          {t('form.add')} — {t(config.addLabelKey)}
        </Button>
      </div>
    </div>);

}
