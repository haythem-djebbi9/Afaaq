import { z } from 'zod';
import type { FieldConfig, StepConfig } from '../types/formConfig';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationMessages {
  required: string;
  email: string;
}

function scalarSchema(f: FieldConfig, msg: ValidationMessages): z.ZodType {
  if (f.type === 'checkbox') {
    return z.boolean().optional().default(false);
  }

  let schema: z.ZodType = z.string();
  schema = f.required ? (schema as z.ZodString).min(1, msg.required) : schema.optional().default('');

  if (f.type === 'email') {
    schema = schema.refine((v) => !v || EMAIL_RE.test(String(v)), { message: msg.email });
  }

  return schema;
}

export function buildStepSchema(step: StepConfig, msg: ValidationMessages) {
  const shape: Record<string, z.ZodType> = {};

  for (const f of step.fields ?? []) {
    if (f.kind === 'field') {
      shape[f.key] = scalarSchema(f, msg);
      continue;
    }

    const rowShape: Record<string, z.ZodType> = {};
    for (const rf of f.fields) {
      rowShape[rf.key] = scalarSchema(rf, msg);
    }
    let arraySchema = z.array(z.object(rowShape));
    if (f.minItems > 0) {
      arraySchema = arraySchema.min(f.minItems, msg.required);
    }
    shape[f.key] = arraySchema;
  }

  return z.object(shape);
}

export function emptyRowFor(fields: FieldConfig[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? false : '']));
}

export function buildStepDefaults(
  step: StepConfig,
  existing: Record<string, unknown> | undefined
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const f of step.fields ?? []) {
    if (f.kind === 'field') {
      const existingValue = existing?.[f.key];
      defaults[f.key] = existingValue ?? (f.type === 'checkbox' ? false : '');
      continue;
    }

    const existingRows = existing?.[f.key] as Record<string, unknown>[] | undefined;
    if (existingRows && existingRows.length > 0) {
      defaults[f.key] = existingRows;
    } else {
      defaults[f.key] = f.minItems > 0 ? [emptyRowFor(f.fields)] : [];
    }
  }

  return defaults;
}
