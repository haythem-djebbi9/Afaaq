import type { RepeatableFieldConfig, StepConfig } from '@/shared/types/formConfig';

function singleRepeatableKey(step: StepConfig): string | null {
  if (step.fields?.length === 1 && step.fields[0].kind === 'repeatable') {
    return (step.fields[0] as RepeatableFieldConfig).key;
  }
  return null;
}

/** Initial form values for a step, sourced from the flat stepData bag keyed by backend column. */
export function stepInitialData(
  step: StepConfig,
  stepData: Record<string, unknown>
): Record<string, unknown> {
  const key = singleRepeatableKey(step);
  if (key) return { [key]: stepData[key] ?? [] };
  return (stepData[step.id] as Record<string, unknown>) ?? {};
}

/** Maps a step's submitted form data to the PATCH payload shape expected by the backend. */
export function stepPatchPayload(
  step: StepConfig,
  formData: Record<string, unknown>
): Record<string, unknown> {
  const key = singleRepeatableKey(step);
  if (key) return { [key]: formData[key] };
  return { [step.id]: formData };
}
