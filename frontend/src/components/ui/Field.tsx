import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

const controlBase =
'w-full rounded-[10px] border border-ink-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500/70 transition-colors focus:border-afaaq-blue focus:outline-none focus:ring-4 focus:ring-afaaq-blue/10';

const controlError = 'border-red-300 focus:border-red-500 focus:ring-red-500/10';
const controlValid = 'border-emerald-300';

interface LabelWrapProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function LabelWrap({ label, htmlFor, hint, error, required, children }: LabelWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-700">
        {label}
        {required && <span className="text-afaaq-gold-600"> *</span>}
      </label>
      {children}
      <AnimatePresence mode="wait" initial={false}>
        {error ?
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.18 }}
          className="text-xs font-medium text-red-600"
          role="alert">
          {error}
        </motion.p> :
        hint ?
        <p key="hint" className="text-xs text-ink-500">{hint}</p> :
        null}
      </AnimatePresence>
    </div>);

}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, valid, icon, trailing, id, required, className = '', ...rest },
  ref
) {
  const fieldId = id || `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const showValid = valid && !error && !trailing;
  return (
    <LabelWrap label={label} htmlFor={fieldId} hint={hint} error={error} required={required}>
      <div className="relative">
        {icon &&
        <span className="pointer-events-none absolute inset-y-0 start-0 flex w-11 items-center justify-center text-ink-500">
            {icon}
          </span>
        }
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={`${controlBase} h-11 ${icon ? 'ps-11' : ''} ${trailing || showValid ? 'pe-11' : ''} ${
          error ? controlError : valid ? controlValid : ''} ${className}`}
          {...rest} />

        {trailing &&
        <span className="absolute inset-y-0 end-0 flex w-11 items-center justify-center">{trailing}</span>
        }
        {showValid &&
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-emerald-500">
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
        </motion.span>
        }
      </div>
    </LabelWrap>);

});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: {value: string;label: string;}[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, id, required, className = '', ...rest },
  ref
) {
  const fieldId = id || `s-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <LabelWrap label={label} htmlFor={fieldId} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={`${controlBase} h-11 appearance-none pe-10 ${error ? controlError : ''} ${className}`}
          {...rest}>

          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-ink-500"
          aria-hidden="true" />

      </div>
    </LabelWrap>);

});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, required, className = '', ...rest },
  ref
) {
  const fieldId = id || `t-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <LabelWrap label={label} htmlFor={fieldId} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={`${controlBase} py-3 ${error ? controlError : ''} ${className}`}
        rows={4}
        {...rest} />
    </LabelWrap>);

});

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className = '', ...rest },
  ref
) {
  const fieldId = id || `c-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-200 text-afaaq-blue focus:ring-afaaq-blue"
        {...rest} />

      <label htmlFor={fieldId} className="text-[13px] leading-5 text-ink-700">
        {label}
      </label>
    </div>);

});
