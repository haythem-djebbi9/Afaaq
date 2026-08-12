import type { FormConfig } from '../form-config/form-config.types';

const NON_TRANSLATABLE_KEYS = new Set(['passportNumber', 'postalCode']);
const TRANSLATABLE_TYPES = new Set(['text', 'textarea']);

export interface TranslatableEntry {
  path: string;
  value: string;
}

/**
 * Walks the form config to find every genuinely free-text value in the application's
 * step data (as opposed to codes/dates/select values, which are already localized via
 * the existing i18n dictionary and don't need Groq translation).
 */
export function collectTranslatableEntries(
  config: FormConfig,
  stepData: Record<string, unknown>,
): TranslatableEntry[] {
  const entries: TranslatableEntry[] = [];

  for (const step of config.steps) {
    if (step.kind !== 'fields') continue;

    for (const f of step.fields ?? []) {
      if (f.kind === 'field') {
        if (!TRANSLATABLE_TYPES.has(f.type) || NON_TRANSLATABLE_KEYS.has(f.key)) {
          continue;
        }
        const bag = (stepData[step.id] as Record<string, unknown>) ?? {};
        const raw = bag[f.key];
        if (typeof raw === 'string' && raw.trim()) {
          entries.push({ path: `${step.id}.${f.key}`, value: raw });
        }
        continue;
      }

      const rows = (stepData[f.key] as Record<string, unknown>[] | undefined) ?? [];
      rows.forEach((row, index) => {
        for (const rf of f.fields) {
          if (!TRANSLATABLE_TYPES.has(rf.type) || NON_TRANSLATABLE_KEYS.has(rf.key)) {
            continue;
          }
          const raw = row?.[rf.key];
          if (typeof raw === 'string' && raw.trim()) {
            entries.push({ path: `${f.key}.${index}.${rf.key}`, value: raw });
          }
        }
      });
    }
  }

  return entries;
}
