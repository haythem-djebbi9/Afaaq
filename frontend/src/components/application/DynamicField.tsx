import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Checkbox, Input, Select, Textarea } from '../ui/Field';
import { useLocale } from '../../contexts/LocaleContext';
import type { FieldConfig } from '../../types/formConfig';

interface Props {
  field: FieldConfig;
  name: string;
  register: UseFormRegister<Record<string, unknown>>;
  error?: string;
}

export function DynamicField({ field, name, register, error }: Props) {
  const { t } = useLocale();
  const label = t(field.labelKey);

  if (field.type === 'select') {
    return (
      <Select
        label={label}
        required={field.required}
        placeholder={t('form.select')}
        error={error}
        options={(field.options ?? []).map((o) => ({ value: o.value, label: t(o.labelKey) }))}
        {...register(name)} />);


  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        label={label}
        required={field.required}
        error={error}
        maxLength={field.maxLength}
        {...register(name)} />);


  }

  if (field.type === 'checkbox') {
    return <Checkbox label={label} {...register(name)} />;
  }

  return (
    <Input
      type={field.type}
      label={label}
      required={field.required}
      error={error}
      {...register(name)} />);


}
